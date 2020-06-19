import {
	constants,

	toInitGL,
	// toDrawMode,
} from '../lib/glUtils';

const {
	GL_DATA_TYPES,
	GL_BUFFER_TARGETS,
	GL_BUFFER_USAGES,
	// GL_DRAW_MODES,
} = constants;
const { ARRAY_BUFFER } = GL_BUFFER_TARGETS;
const { FLOAT } = GL_DATA_TYPES;
const { STATIC_DRAW } = GL_BUFFER_USAGES;
// const { TRIANGLES, TRIANGLE_FAN } = GL_DRAW_MODES;

import { object, array } from '../lib/fp';
const { forEach } = object;
const { push, zip } = array;

const shaderIDs = ['shader-fs', 'shader-vs'];
const bufferConfigs = [
	{
		bufferName: 'vertices',
		bufferTarget: ARRAY_BUFFER,
		bufferType: Float32Array,
		bufferUsage: STATIC_DRAW,
		attribs: [{ name: 'position', size: 3, dataType: FLOAT }]
	},
	{
		bufferName: 'colors',
		bufferTarget: ARRAY_BUFFER,
		bufferType: Float32Array,
		bufferUsage: STATIC_DRAW,
		attribs: [{ name: 'color', size: 4, dataType: FLOAT }]
	},
	// TODO: Does this really belong in the bufferConfigs?
	// It's really more just depicting a location in the program.
	{
		bufferName: 'mvMat',
		bufferType: Float32Array,
		uniforms: [{ name: 'modelViewMatrix' }]
	}
];

const pushPoints = (...vals) => push(...vals.flat());

// const toDrawGeometry = gl => 
// {
// 	const toGLDrawMode = toDrawMode(gl);

// 	return (generatorConfig, drawMode) => 
// 	{
// 		const generateData = reduce((_, { name, data }) => generatorConfig[name](data));
// 		const toBufferLength = ({ data: { length }, pointLength }) => length / pointLength;
// 		const glDrawMode = toGLDrawMode(drawMode);

// 		return (...buffers) =>
// 		{
// 			const prevLength = toBufferLength(buffers[0]);
// 			generateData(buffers);
// 			const curLength = toBufferLength(buffers[0]);

// 			return () => gl.drawArrays(glDrawMode, prevLength, curLength - prevLength);
// 		};
// 	};
// };

const render = () =>
{
	setTimeout(() => window.requestAnimationFrame(render), 5);
};

const toGeneratePrimitive = buffers => config => forEach((updateData, updateName, updates) => config[updateName](updateData, updates)(buffers[updateName].data));

const toTransformationMatrix = (location, shouldTranspose, { bufferType }) =>
{
	const data = [[], [], [], []];
	return {
		update: () => gl.uniformMatrix4fv(location, shouldTranspose, new bufferType(...data.flat())),
		applyTransformations: (...transformations) => transformations.reduce((acc, transformation) => multiplyMatrices(acc, transformation), data)
	};
};

import { lookAt } from '../lib/matrices';
const main = () => 
{
	const screen = document.getElementById('screen');
	const gl = screen.getContext('webgl2');

	const [{ locations }, buffers] = toInitGL(gl)(shaderIDs, bufferConfigs);
	// const modelViewMatrix = toTransformationMatrix(locations.modelViewMatrix, false, buffers.mvMat);
	
	let eye = [2, -3.25, 2];
	let at	= [0, -4, 0];
	let up	= [0, 1, 0];

	console.log(lookAt(eye, at, up));

	/*
	const generatePrimitive = toGeneratePrimitive(buffers);
	const generateTriangle = generatePrimitive({ 
		vertices: ([a, b, c]) => pushPoints(a, b, c),
		colors: ([a, b, c]) => pushPoints(a, b, c),
	});
	const generateQuad = generatePrimitive({
		vertices: ([a, b, c, d]) => pushPoints(a, b, c, a, c, d),
		colors: ([a, b, c, d]) => pushPoints(a, b, c, a, c, d)
	});

	// generateTriangle({ vertices: [[1, -1, 0], [0, 1, 0], [-1, -1, 0]], colors: [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]] });
	generateQuad({
		vertices: [[1, -1, 0], [1, 1, 0], [-1, 1, 0], [-1, -1, 0]],
		colors: [[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], [0.5, 0.5, 0, 1]]
	});

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.disable(gl.DEPTH_TEST);

	const { vertices, colors } = buffers;

	gl.bindBuffer(vertices.glTarget, vertices.glBuffer);
	gl.bufferData(vertices.glTarget, new vertices.type(vertices.data), vertices.usage);

	gl.bindBuffer(colors.glTarget, colors.glBuffer);
	gl.bufferData(colors.glTarget, new colors.type(colors.data), colors.usage);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
	*/
};

window.onload = main;
