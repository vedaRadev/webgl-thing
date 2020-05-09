import { array, object } from '../../fp';
const { zip } = array;
const { reduce, pluck } = object;

import { isNil } from '../../pred';

import { 
	SHADERTYPE_FRAGMENT,
	SHADERTYPE_VERTEX,
	GL_DATA_TYPES,
	GL_BUFFER_TARGETS,
} from './constants';

const toShaderType = ({ FRAGMENT_SHADER, VERTEX_SHADER } = {}) =>
{
	if (!(FRAGMENT_SHADER && VERTEX_SHADER)) return;
	const glShaderTypes = [[SHADERTYPE_FRAGMENT, FRAGMENT_SHADER], [SHADERTYPE_VERTEX, VERTEX_SHADER]];

	return type =>
	{
		if (!type) return;

		const [, glShaderType] = glShaderTypes.find(([s]) => s === type) || [];
		return glShaderType;
	};
};

const toShader = gl =>
{
	const toGLShaderType = toShaderType(gl);

	return id => 
	{
		const script = document.getElementById(id);
		if (!script) return;

		const { type: shaderType, text: source } = script;
		const shader = gl.createShader(toGLShaderType(shaderType));
		if (!shader) return;

		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		{
			alert(gl.getShaderInfoLog(shader));
			return;
		}

		return shader;
	};
};

const toProgram = gl => gl && ((...shaders) =>
{
	const program = gl.createProgram();
	shaders.forEach(shader => gl.attachShader(program, shader));
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) alert('Unable to initialize shaders');
	gl.useProgram(program);

	const toAttribLocation = gl.getAttribLocation.bind(gl, program);
	return attribNames =>
	{
		const attribLocations = attribNames.map(toAttribLocation);
		attribLocations.forEach(loc => gl.enableVertexAttribArray(loc));
		zip(attribNames, attribLocations).forEach(([name, location]) => program[name] = location);
		return program;
	};
});

const toDataType = gl => 
{
	const glDataTypeLookup = reduce(
		(acc, v, k) => [...acc, [v, gl[k]]], 
		[]
	)(GL_DATA_TYPES);

	return typeString =>
	{
		const [, glDataType] = glDataTypeLookup.find(([entry]) => entry === typeString) || [];
		if (!glDataType) console.warn(`${typeString} is not a valid webgl data type`);
		return glDataType;
	};
};

const toBufferTarget = gl => 
{
	const glBufferTargetLookup = reduce(
		(acc, v, k) => [...acc, [v, gl[k]]],
		[]
	)(GL_BUFFER_TARGETS);

	return targetString => 
	{
		const [, glBufferTarget] = glBufferTargetLookup.find(([entry]) => entry === targetString) || [];
		if (!glBufferTarget) console.warn(`${targetString} is not a valid webgl buffer target`);
		return glBufferTarget;
	};
};

const toTotalAttribSize = arr => arr.reduce((totalSize, { size }) => totalSize + size, 0);

// TODO: Handle situation where interleaved buffer has multiple attribs that are not of the same
// data type (is that even possible?)
const toBufferData = gl => 
{
	const toGLDataType = toDataType(gl);
	const toGLBufferTarget = toBufferTarget(gl);

	return (program, bufferConfigs) => bufferConfigs.reduce((buffers, config) => 
	{
		const { bufferID, bufferTarget, bufferType, attribs } = config;

		const buffer = gl.createBuffer();

		const glBufferTarget = toGLBufferTarget(bufferTarget);
		const stride = attribs.length > 1 ? toTotalAttribSize(attribs) : 0;
		gl.bindBuffer(glBufferTarget, buffer);
		// Automatic interleaving for a buffer with multiple attribs
		attribs.forEach(({ name, size, dataType, normalized }, idx) => 
			gl.vertexAttribPointer(
				program[name],
				size,
				toGLDataType(dataType),
				!!normalized,
				stride && stride * bufferType.BYTES_PER_ELEMENT,
				idx && toTotalAttribSize(attribs.slice(0, idx - 1))
			)
		);

		return {...buffers, [bufferID]: { buffer, target: glBufferTarget, type: bufferType } };
	}, {});
};

const toInitGL = gl =>
{
	if (isNil(gl)) throw new Error('WebGL context cannot be undefined');

	const toGLProgram = toProgram(gl);
	const toGLShader = toShader(gl);
	const toGLBufferData = toBufferData(gl);
	
	return (shaderIDs, bufferConfigs) =>
	{
		const program = toGLProgram(...shaderIDs.map(toGLShader))(
			bufferConfigs
				.map(pluck('attribs'))
				.flat()
				.map(pluck('name'))
				.reduce((acc, name) => acc.find(v => v === name) ? acc : [...acc, name], [])
		);

		const buffers = toGLBufferData(program, bufferConfigs);

		return [program, buffers];
	};
};

export default toInitGL;
