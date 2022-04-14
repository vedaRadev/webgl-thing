// TODO: Everything here is pretty much "happy path".  Need to add more defaulting, warnings, and
// errors.  There are some places where an undefined will be explicitly returned when maybe we
// should be returning an error.
// TODO: Some of these things should maybe be moved into a different module specifically for
// view-related operations.  Currently matrix operations and graphic-specific operations that happen
// to work on matrices are jammed together into here.

// TODO: This file probably has a lot of room for improvement. Definitely too much functional stuff when it really needs
// performance optimzations.

import { object, array } from './fp/index.js';
const { zip } = array;
const { pluck } = object;
import {
	and,
	or,
	not,
	where,
	isSameTypeAs,
	isNumber,
	isArray,
	isStrictlyEqualTo,
	checkEntries,
} from './pred.js';

export const toRadians = degrees => degrees * Math.PI / 180;

export const isJagged = ([ head, ...tail ]) => tail.some(({ length }) => length !== head.length);
export const isVector = v => isArray(v) && v.every(e => !isArray(e));
export const isMatrix = m => isArray(m) && m.every(e => isArray(e));

// TODO: work with n-dimensional matrices
export const isSquare = or(
	and(isVector, where(pluck('length'), isStrictlyEqualTo(1))),
	and(isMatrix, matrix => matrix.every(where(pluck('length'), isStrictlyEqualTo(matrix.length))))
);

export const isIdentity = and(
	isSquare, 
	matrix => matrix.every((row, idx) => checkEntries({ [idx]: isStrictlyEqualTo(1) }, { rest: isStrictlyEqualTo(0) })(row))
);

export const isMVSEqualTo = mvs => (...params) => {
	if (!params.every(isSameTypeAs(mvs, { matrix: isMatrix, vector: isVector, scalar: isNumber }))) return false; 
	if (isVector(mvs)) return params.every(isVector) && zip(mvs, ...params).every(col => col.reduce((a, b) => a === b));
	if (isMatrix(mvs)) return params.every(isMatrix) && zip(mvs, ...params).map(([head, ...tail]) => isMVSEqualTo(head)(...tail)).every(x => x);

	// mvs is neither a matrix nor a vector
	// could be a scalar (number), string, object, etc
	return params.every(e => e === mvs);
}

export const toTranspose = mv => isMatrix(mv) ? zip(...mv) : mv.map(e => [e]); ; 
export const toIdentityMatrix = size => Array.from(Array(size), (_, r) => Array.from(Array(size), (_, c) => r == c ? 1 : 0));
export const toEmptyMatrix = size => Array(size).fill(Array(size).fill(0));

const toSimpleArithmeticMatrixOperation = operation => (...matrix) => toTranspose(matrix).map(element => isMatrix(element) ? toSimpleArithmeticMatrixOperation(operation)(...element) : element.reduce(operation));

export const add = toSimpleArithmeticMatrixOperation((a, b) => a + b);
export const subtract = toSimpleArithmeticMatrixOperation((a, b) => a - b);

// Currently only configured for 3d vectors
// TODO: cross product for n-dimensional vectors
export const toCrossProduct = (u, v) => {
	if (u.length !== 3 || v.length !== 3) return undefined;

	return [
		u[1] * v[2] - u[2] * v[1],
		u[2] * v[0] - u[0] * v[2],
		u[0] * v[1] - u[1] * v[0]
	];
};

export const toDotProduct = (u, v) => {
	if (u.length !== v.length) return undefined;
	return zip(u, v).reduce((acc, [uVal, vVal]) => acc + uVal * vVal, 0);
};

// TODO: might need to reverse incoming args
export const multiply = (...args) => {
	if (args.some(and(isMatrix, isJagged))) throw new Error('Cannot multiply jagged matrices');

	return args.reverse().reduce((left, right) =>
	{
		if (isNumber(left)) return isVector(right) ? right.map(e => e * left) : right.map(e => multiply(left, e));
		// if (isVector(left) && isMatrix(right) && left.length === right.length) return toTranspose(toTranspose(right).map(row => toDotProduct(left, row)));
		if (isVector(left) && isMatrix(right)) return right.map(row => toDotProduct(left, row));

		// Hadamard product, because why not?
		// if (left.length === right.length && left[0].length === right[0].length) return left.map((row, rowIdx) => row.map((e, idx) => e * right[rowIdx][idx]));

		// Regular matrix multiplication.
		if (left[0].length === right.length) return toTranspose(toTranspose(right).map(rightRow => left.map(leftRow => toDotProduct(leftRow, rightRow))));

		return undefined;
	});
};

// TODO: Hadamard product because why not
// export const toHadamardProduct = (...args) =>
// {
// };

export const toMagnitude = u => Math.sqrt(toDotProduct(u, u));

export const toNormalized = (...u) => {
	const uVec = u.flat();
	const magnitude = toMagnitude(uVec);
	return uVec.map(x => x / magnitude);
};

// mvs: matrix, vector, or scalar
export const toNegated = mvs => not(or(isMatrix, isVector))(mvs) ? -mvs : mvs.map(toNegated);

export const lookAt = (eye, at, up) => {
	if (isMVSEqualTo(eye)(at)) return [...toEmptyMatrix(3).map(arr => [...arr, 1.0]), [0, 0, 0, 1]];

	const v = toNormalized(subtract(eye, at)); // view direction
	const n = toNormalized(toCrossProduct(up, v)); // perpendicular view
	const u = toNormalized(toCrossProduct(v, n)); // adjusted up vector

	const vNegated = toNegated(v);

	return [
		[...n, -toDotProduct(n, eye)],
		[...u, -toDotProduct(u, eye)],
		[...vNegated, -toDotProduct(vNegated, eye)],
		[0, 0, 0, 1.0],
	];
};

export const toOrthographicProjectionMatrix = (left, right, bottom, top, near, far) => {
	if (left === right) throw new Error('left and right cannot be equal');
	if (bottom === top) throw new Error('bottom and top cannot be equal');
	if (near === far) throw new Error('near and far cannot be equal');

	const w = right - left;
	const h = top - bottom;
	const d = far - near;

	return [
		[2.0 / w , 0       , 0        , -(right + left) / (right - left)] ,
		[0       , 2.0 / h , 0        , -(top + bottom) / (top - bottom)] ,
		[0       , 0       , -2.0 / d , -(far + near) / (far - near)]     ,
		[0       , 0       , 0        , 1]
	];
};

export const toPerspectiveProjectionMatrix = (fovy, aspectRatio, near, far) => {
	const tanHalfFOV = Math.tan(toRadians(fovy) / 2);
	const range = near - far;
	
	return [
		[1 / (tanHalfFOV * aspectRatio), 0, 0, 0],
		[0, 1 / tanHalfFOV, 0, 0],
		[0, 0, -(near + far) / range, (2 * near * far) / range],
		[0, 0, 1, 0]
	];
};

export const toTranslationMatrix = (...axes) => {
	const [x, y, z] = axes;
	return [
		[1, 0, 0, x],
		[0, 1, 0, y],
		[0, 0, 1, z],
		[0, 0, 0, 1],
	];
};

// TODO defaulting for axes before normalization
export const toRotationMatrix = (angle, ...axes) => {
	const [x = 0, y = 0, z = 0] = toNormalized(...axes);
	const radians = toRadians(angle);

	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	const omc = 1 - cos;

	return [
		[x*x*omc + cos   , x*y*omc - z*sin , x*z*omc + y*sin , 0],
		[x*y*omc + z*sin , y*y*omc + cos   , y*z*omc - x*sin , 0],
		[x*z*omc - y*sin , y*z + x*sin     , z*z*omc + cos   , 0],
		[0, 0, 0, 1],
	];
};

export const toScaleMatrix = (dimensions = 4) => (...axes) => {
	const flatAxes = axes.flat();
	const scaleAxes = flatAxes.length < 4 ? [...flatAxes, ...Array(4 - flatAxes.length - 1).fill(0), 1] : flatAxes;

	return toIdentityMatrix(dimensions).map((row, idx) => [...row.slice(0, idx), scaleAxes[idx], ...row.slice(idx + 1)]);
};

export const flatten = mv => {
	if (isMatrix(mv)) return toTranspose(mv).flat();
	return mv;
};

// Newell's method
export const toSurfaceNormal = (firstVertex, ...vertices) => [...vertices, firstVertex]
	.reduce(([ux, uy, uz], [vx, vy, vz]) => 
		[(uy - vy) * (uz + vz), (uz - vz) * (ux + vx), (ux - vx) * (uy - vy)],
		firstVertex
	);
