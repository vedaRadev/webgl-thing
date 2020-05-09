import { array, object } from '../../fp';
const { zip } = array;
const { reduce, pluck } = object;

import { isNil } from '../../pred';

import { 
	SHADERTYPE_FRAGMENT,
	SHADERTYPE_VERTEX,
	GL_DATA_TYPES,
	GL_BUFFER_TARGETS,
	GL_BUFFER_USAGES,
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

const toBufferUsage = gl =>
{
	const glBufferUsageLookup = reduce(
		(acc, v, k) => [...acc, [v, gl[k]]],
		[]
	)(GL_BUFFER_USAGES);

	return usageString =>
	{
		const [, glBufferUsage] = glBufferUsageLookup.find(([entry]) => entry === usageString) || [];
		if (!glBufferUsage) console.warn(`${usageString} is not a valid webgl buffer usage`);
		return glBufferUsage;
	};
};

const toTotalAttribSize = arr => arr.reduce((totalSize, { size }) => totalSize + size, 0);

// TODO: Handle situation where interleaved buffer has multiple attribs that are not of the same
// data type (is that even possible?)
const toBuffers = gl => 
{
	const toGLDataType = toDataType(gl);
	const toGLBufferTarget = toBufferTarget(gl);
	const toGLBufferUsage = toBufferUsage(gl);

	return (program, bufferConfigs) => bufferConfigs.reduce((buffers, config) => 
	{
		const { bufferName, bufferTarget, bufferType, bufferUsage, attribs } = config;


		const glBufferTarget = toGLBufferTarget(bufferTarget);
		const glBufferUsage = toGLBufferUsage(bufferUsage);
		const stride = attribs.length > 1 ? toTotalAttribSize(attribs) : 0;

		const buffer = gl.createBuffer();
		gl.bindBuffer(glBufferTarget, buffer);
		gl.bufferData(glBufferTarget, new bufferType([]), glBufferUsage);
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

		const withBindBuffer = fn => (...fnParams) =>
		{
			gl.bindBuffer(glBufferTarget, buffer);
			return fn(...fnParams);
		};

		const toSize = () => gl.getBufferParameter(glBufferTarget, gl.BUFFER_SIZE); 
		const toLength = () => toSize() / bufferType.BYTES_PER_ELEMENT;

		const updateData = (dstByteOffset, srcData, srcOffset, length = 0) => gl.bufferSubData(glBufferTarget, dstByteOffset, new bufferType(srcData), srcOffset, length); 
		const appendData = (srcData, srcOffset, length) => updateData(toSize() + 1, srcData, length);
		const setData = data => gl.bufferData(glBufferTarget, new bufferType(data), glBufferUsage);

		return {
			...buffers,
			[bufferName]: {
				updateData: withBindBuffer(updateData),
				appendData: withBindBuffer(appendData),
				setData: withBindBuffer(setData),
				toSize: withBindBuffer(toSize),
				toLength: withBindBuffer(toLength)
			}
		};
	}, {});
};

const toInitGL = gl =>
{
	if (isNil(gl)) throw new Error('WebGL context cannot be undefined');

	const toGLProgram = toProgram(gl);
	const toGLShader = toShader(gl);
	const toGLBuffers = toBuffers(gl);
	
	return (shaderIDs, bufferConfigs) =>
	{
		const program = toGLProgram(...shaderIDs.map(toGLShader))(
			bufferConfigs
				.map(pluck('attribs'))
				.flat()
				.map(pluck('name'))
				.reduce((acc, name) => acc.find(v => v === name) ? acc : [...acc, name], [])
		);

		const buffers = toGLBuffers(program, bufferConfigs);

		return [program, buffers];
	};
};

export default toInitGL;
