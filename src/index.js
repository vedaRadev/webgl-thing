// TODO: install ctags on this machine
import toInitGL, {
	GL_DATA_TYPES,
	GL_BUFFER_TARGETS
} from '../lib/glSetup';

const { ARRAY_BUFFER } = GL_BUFFER_TARGETS;
const { FLOAT } = GL_DATA_TYPES;

const shaderIDs = ['shader-fs', 'shader-vs'];
// const bufferConfigs = [
// 	{
// 		bufferID: 'foo',
// 		bufferTarget: ARRAY_BUFFER,
// 		bufferType: Float32Array,
// 		attribs: [
// 			{ name: 'position', size: 3, dataType: FLOAT },
// 			{ name: 'color', size: 4, dataType: FLOAT }
// 		]
// 	},
// ];
const bufferConfigs = [
	{
		bufferID: 'vertices',
		bufferTarget: ARRAY_BUFFER,
		bufferType: Float32Array,
		attribs: [{ name: 'position', size: 3, dataType: FLOAT }]
	},

	{
		bufferID: 'colors',
		bufferTarget: ARRAY_BUFFER,
		bufferType: Float32Array,
		attribs: [{ name: 'color', size: 4, dataType: FLOAT }]
	}
];

const main = () => 
{
	const screen = document.getElementById('screen');
	const gl = screen.getContext('webgl2');
	const [program, buffers] = toInitGL(gl)(shaderIDs, bufferConfigs);

	console.log(buffers);

	const { vertices, colors } = buffers;


	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.disable(gl.DEPTH_TEST);

	vertices.push(0.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	colors.push(1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	// LEGACY: Keeping here so I don't forget how to do this stuff
	// const vertexBuffer = gl.createBuffer();
	// gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	// 	0.0, 1.0, 0.0,
	// 	-1.0, -1.0, 0.0,
	// 	1.0, -1.0, 0.0
	// ]), gl.STATIC_DRAW);

	// const colorBuffer = gl.createBuffer();
	// gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	// gl.vertexAttribPointer(program.color, 4, gl.FLOAT, false, 0, 0);
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	// 	1.0, 0.0, 0.0, 1.0,
	// 	0.0, 0.0, 1.0, 1.0,
	// 	0.0, 1.0, 0.0, 1.0,
	// ]), gl.STATIC_DRAW);

	gl.drawArrays(gl.TRIANGLES, 0, 3);
};

window.onload = main;
