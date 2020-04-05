// TODO: install ctags on this machine
import toGLSetup from '../lib/glSetup';
import { isNil } from '../lib/pred';

const shaderIDs = ['shader-fs', 'shader-vs'];
const vertexAttribs = ['position', 'color'];
// TODO: make metaVertexAttribData const so that it doesn't have be manually defined inline?
// would help reduce redundancy

const main = () => 
{
	const screen = document.getElementById('screen');
	const gl = screen.getContext('webgl');

	if (!isNil(gl))
	{
		const { toGLShader, toGLProgram } = toGLSetup(gl);
		const program = toGLProgram(...shaderIDs.map(toGLShader))(...vertexAttribs);

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.disable(gl.DEPTH_TEST);

		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0.0, 1.0, 0.0,
			-1.0, -1.0, 0.0,
			1.0, -1.0, 0.0
		]), gl.STATIC_DRAW);

		const colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.vertexAttribPointer(program.color, 4, gl.FLOAT, false, 0, 0);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			1.0, 0.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
		]), gl.STATIC_DRAW);

		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
};

window.onload = main;
