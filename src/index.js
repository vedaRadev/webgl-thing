import {
	constants,

	toInitGL,
	toDrawMode,
} from '../lib/glUtils';

const {
	GL_DATA_TYPES,
	GL_BUFFER_TARGETS,
	GL_BUFFER_USAGES,
	GL_DRAW_MODES,
} = constants;
const { ARRAY_BUFFER } = GL_BUFFER_TARGETS;
const { FLOAT } = GL_DATA_TYPES;
const { STATIC_DRAW } = GL_BUFFER_USAGES;
const { TRIANGLES, TRIANGLE_FAN } = GL_DRAW_MODES;

import { object, array, pipe } from '../lib/fp';
const { map, pluck, reduce } = object;
const { push } = array;

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
	}
];

const toDrawShape = gl => 
{
	const toGLDrawMode = toDrawMode(gl);

	return (generatorConfig, drawMode) => 
	{
		const generateData = reduce((_, { name, data }) => generatorConfig[name](data));
		const toBufferLength = ({ data: { length }, pointLength }) => length / pointLength;
		const glDrawMode = toGLDrawMode(drawMode);

		return (...buffers) =>
		{
			const prevLength = toBufferLength(buffers[0]);
			generateData(buffers);
			const curLength = toBufferLength(buffers[0]);

			return () => gl.drawArrays(glDrawMode, prevLength, curLength - prevLength);
		};
	};
};

const main = () => 
{
	const screen = document.getElementById('screen');
	const gl = screen.getContext('webgl2');

	const [, { vertices, colors }] = toInitGL(gl)(shaderIDs, bufferConfigs);
	const toDrawGLShape = toDrawShape(gl);

	const drawTriangle = toDrawGLShape(({
		vertices: push(0.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0),
		colors: push(1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0)
	}), TRIANGLES)(vertices, colors);

	const drawSquare = toDrawGLShape(({
		vertices: push(1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0),
		colors: push(1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0)
	}), TRIANGLE_FAN)(vertices, colors);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.disable(gl.DEPTH_TEST);

	gl.bindBuffer(vertices.target, vertices.buffer);
	gl.bufferData(vertices.target, new vertices.type(vertices.data), vertices.usage);

	gl.bindBuffer(colors.target, colors.buffer);
	gl.bufferData(colors.target, new colors.type(colors.data), colors.usage);

	drawSquare();
	drawTriangle();
};

window.onload = main;
