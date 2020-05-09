// TODO: install ctags on this machine
import toInitGL, {
	GL_DATA_TYPES,
	GL_BUFFER_TARGETS
} from '../lib/glSetup';

const { ARRAY_BUFFER } = GL_BUFFER_TARGETS;
const { FLOAT } = GL_DATA_TYPES;

const shaderIDs = ['shader-fs', 'shader-vs'];
const bufferConfigs = [
	{
		bufferID: 'vertexBuffer',
		bufferTarget: ARRAY_BUFFER,
		bufferType: Float32Array,
		attribs: [{ name: 'position', size: 3, dataType: FLOAT }]
	},
	{
		bufferID: 'colorBuffer',
		bufferTarget: ARRAY_BUFFER,
		bufferType: Float32Array,
		attribs: [{ name: 'color', size: 4, dataType: FLOAT }]
	}
];

const main = () => 
{
	const screen = document.getElementById('screen');
	const gl = screen.getContext('webgl2');
	const [, { vertexBuffer, colorBuffer }] = toInitGL(gl)(shaderIDs, bufferConfigs);
	const vertices = [];
	const colors = [];

	vertices.push(0.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0);
	gl.bindBuffer(vertexBuffer.target, vertexBuffer.buffer);
	gl.bufferData(vertexBuffer.target, new vertexBuffer.type(vertices), gl.STATIC_DRAW);

	colors.push(1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0);
	gl.bindBuffer(colorBuffer.target, colorBuffer.buffer);
	gl.bufferData(colorBuffer.target, new colorBuffer.type(colors), gl.STATIC_DRAW);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.disable(gl.DEPTH_TEST);

	gl.drawArrays(gl.TRIANGLES, 0, 3);
};

window.onload = main;
