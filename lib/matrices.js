import { array } from './fp';
import { or, not, isSameTypeAs } from './pred';
const { zip } = array;

export const isJagged = ([ head, ...tail ]) => tail.some(({ length }) => length !== head.length);
export const isVector = v => Array.isArray(v) && v.every(e => !Array.isArray(e));
export const isMatrix = m => Array.isArray(m) && m.every(e => Array.isArray(e));
export const isEqualTo = mv => (...params) => 
{
	if (!params.every(isSameTypeAs(mv, { matrix: isMatrix, vector: isVector }))) return false; 
	if (isVector(mv)) return params.every(isVector) && zip(mv, ...params).every(col => col.reduce((a, b) => a === b));
	if (isMatrix(mv)) return params.every(isMatrix) && zip(mv, ...params).map(([head, ...tail]) => isEqualTo(head)(...tail)).every(x => x);

	// mv is neither a matrix nor a vector
	return params.every(e => e === mv);
}

export const toTransposed = matrix => zip(...matrix);
export const toIdentity = size => Array.from(Array(size), (_, r) => Array.from(Array(size), (_, c) => r == c ? 1 : 0));
export const toEmptyMatrix = size => Array(size).fill(Array(size).fill(0));

const toSimpleArithmeticMatrixOperation = operation => 
	(...matrices) => 
		zip(...matrices).map(element => isMatrix(element) ? toSimpleArithmeticMatrixOperation(operation)(...element) : element.reduce(operation));

export const add = toSimpleArithmeticMatrixOperation((a, b) => a + b);
export const subtract = toSimpleArithmeticMatrixOperation((a, b) => a - b);

// Currently only configured for 3d vectors
export const toCrossProduct = (u, v) =>
{
	if (u.length !== 3 || v.length !== 3) return undefined;

	return [
		u[1] * v[2] - u[2] * v[1],
		u[2] * v[0] - u[0] * v[2],
		u[0] * v[1] - u[1] * v[0]
	];
};

export const toDotProduct = (u, v) =>
{
	if (u.length !== v.length) return undefined;
	return zip(u, v).reduce((acc, [uVal, vVal]) => acc + uVal * vVal, 0);
};

// TODO: If cannot multiply matrices, need to tell user at which point it failed
// TODO: if mvs is scalar, multiply differently
export const multiply = (mvs /* matrix, vector, or scalar */, ...args) =>
{
	// All matrices
	return args.reduce((left, right) => 
	{
		const rightTransposed = toTransposed(right);
		return left.reduce((multiplied, leftRow) => [...multiplied, rightTransposed.map(rightRow => toDotProduct(leftRow, rightRow))], []);
	}, mvs);
};

export const toMagnitude = u => Math.sqrt(toDotProduct(u, u));

export const toNormalized = u =>
{
	const magnitude = toMagnitude(u);
	return u.map(x => x / magnitude);
};

// mvs: matrix, vector, or scalar
export const toNegated = mvs => not(or(isMatrix, isVector))(mvs) ? -mvs : mvs.map(toNegated);

export const lookAt = (eye, at, up) =>
{
	if (isEqualTo(eye)(at)) return [...toEmptyMatrix(3).map(arr => [...arr, 1.0]), [0, 0, 0, 1]];

	const v = toNormalized(subtract(at, eye)); // view direction
	const n = toNormalized(toCrossProduct(v, up)); // perpendicular view
	const u = toNormalized(toCrossProduct(n, v)); // adjusted up vector

	const vNegated = toNegated(v);

	return [
		[...n, -toDotProduct(n, eye)],
		[...u, -toDotProduct(u, eye)],
		[...vNegated, -toDotProduct(vNegated, eye)]
		[0, 0, 0, 1.0],
	];
};
