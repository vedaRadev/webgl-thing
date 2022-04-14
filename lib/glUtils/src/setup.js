import { array, object } from '../../fp/index.js';
const { zip } = array;
const { pluck } = object;

import { isNil } from '../../pred.js';

import { 
	SHADERTYPE_FRAGMENT,
	SHADERTYPE_VERTEX,
} from './constants.js';

import { toBufferTarget, toBufferUsage, toDataType } from './utils.js';

const toShaderType = ({ FRAGMENT_SHADER, VERTEX_SHADER } = {}) => {
	if (!(FRAGMENT_SHADER && VERTEX_SHADER)) return;
	const glShaderTypes = [[SHADERTYPE_FRAGMENT, FRAGMENT_SHADER], [SHADERTYPE_VERTEX, VERTEX_SHADER]];

	return type => {
		if (!type) return;

		const [, glShaderType] = glShaderTypes.find(([s]) => s === type) || [];
		return glShaderType;
	};
};

const toShader = gl => {
	const toGLShaderType = toShaderType(gl);

	return id => {
		const script = document.getElementById(id);
		if (!script) throw new Error(`Could not find script with id ${id}`);

		const { type: shaderType, text: source } = script;
		const shader = gl.createShader(toGLShaderType(shaderType));
		if (!shader) throw new Error(`Could not create shader of type ${shaderType}`);

		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));

		return shader;
	};
};

const toProgram = gl => gl && ((...shaders) => {
	const program = gl.createProgram();
	shaders.forEach(shader => gl.attachShader(program, shader));
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) alert('Unable to initialize shaders');
	gl.useProgram(program);

	program['locations'] = {};
	const toAttribLocation = gl.getAttribLocation.bind(gl, program);
	const toUniformLocation = gl.getUniformLocation.bind(gl, program);

	return (attribNames, uniformNames) => {
		// attribs
		if (attribNames) {
			const attribLocations = attribNames.map(toAttribLocation);
			zip(attribNames, attribLocations).forEach(([name, location]) => program.locations[name] = location);
		}

		//  uniforms
		if (uniformNames) {
			const uniformLocations = uniformNames.map(toUniformLocation);
			zip(uniformNames, uniformLocations).forEach(([name, location]) => program.locations[name] = location);
		}

		return program;
	};
});

const toTotalAttribSize = arr => arr.reduce((totalSize, { size }) => totalSize + size, 0);

// TODO: Handle situation where interleaved buffer has multiple attribs that are not of the same
// data type (is that even possible?)
const toBuffers = gl => {
	const toGLDataType = toDataType(gl);
	const toGLBufferTarget = toBufferTarget(gl);
	const toGLBufferUsage = toBufferUsage(gl);

	return (program, bufferConfigs) => bufferConfigs.reduce((buffers, config) => {
		const { bufferName, bufferTarget, bufferType, bufferUsage, attribs } = config;

		const glBufferTarget = toGLBufferTarget(bufferTarget);
		const glBufferUsage = toGLBufferUsage(bufferUsage);

		const totalAttribSize = toTotalAttribSize(attribs);
		const stride = attribs.length > 1 ? totalAttribSize : 0;

		const glBuffer = gl.createBuffer();
		gl.bindBuffer(glBufferTarget, glBuffer);

		// Automatic interleaving for a buffer with multiple attribs
		attribs.forEach(({ name, size, dataType, normalized }, idx) => {
			gl.enableVertexAttribArray(program.locations[name]);
			gl.vertexAttribPointer(
				program.locations[name],
				size,
				toGLDataType(dataType),
				!!normalized,
				stride && stride * bufferType.BYTES_PER_ELEMENT,
				idx && toTotalAttribSize(attribs.slice(0, idx - 1))
			);
		});

		return {
			...buffers,
			[bufferName]: {
				name: bufferName,
				glBuffer,
				glTarget: glBufferTarget,
				data: [],
				type: bufferType,
				usage: glBufferUsage,
				pointLength: totalAttribSize,
			}
		};
	}, {});
};

export const toInitGL = gl => {
	if (isNil(gl)) throw new Error('WebGL context cannot be undefined');

	const toGLProgram = toProgram(gl);
	const toGLShader = toShader(gl);
	const toGLBuffers = toBuffers(gl);

	return (shaderIDs, glConfig) => {
		const attribNames = glConfig.buffers.map(pluck('attribs')).flat().map(pluck('name'));
		const uniformNames = glConfig.uniforms;

		const program = toGLProgram(...shaderIDs.map(toGLShader))(attribNames, uniformNames);
		const buffers = toGLBuffers(program, glConfig.buffers);

		return [program, buffers];
	};
};
