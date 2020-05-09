// TODO: install ctags on this machine
import toInitGL, {
	GL_DATA_TYPES,
	GL_BUFFER_TARGETS,
	GL_BUFFER_USAGES,
} from '../lib/glSetup';

const { ARRAY_BUFFER } = GL_BUFFER_TARGETS;
const { FLOAT } = GL_DATA_TYPES;
const { STATIC_DRAW } = GL_BUFFER_USAGES;

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

const toDrawTriangle = gl => (vertexBuffer, colorBuffer) => 
{
	const shapeDataIndexInBuffer = vertexBuffer.toLength() + 1;

	vertexBuffer.setData([
		0.0, 1.0, 0.0, 
		-1.0, -1.0, 0.0, 
		1.0, -1.0, 0.0
	]);

	colorBuffer.setData([
		1.0, 0.0, 0.0, 1.0, 
		0.0, 0.0, 1.0, 1.0, 
		0.0, 1.0, 0.0, 1.0
	]);

	return () => gl.drawArray(gl.TRIANGLES, shapeDataIndexInBuffer, shapeDataIndexInBuffer + 3);
};

const main = () => 
{
	const screen = document.getElementById('screen');
	const gl = screen.getContext('webgl2');

	const [, { vertices, colors }] = toInitGL(gl)(shaderIDs, bufferConfigs);

	const drawTriangle = toDrawTriangle(gl)(vertices, colors);
	console.log(vertices.toLength());

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.disable(gl.DEPTH_TEST);

	drawTriangle();
};

window.onload = main;
