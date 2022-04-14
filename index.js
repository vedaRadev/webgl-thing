import { constants, toInitGL } from './lib/glUtils/index.js';

const { GL_DATA_TYPES, GL_BUFFER_TARGETS, GL_BUFFER_USAGES } = constants;
const { ARRAY_BUFFER } = GL_BUFFER_TARGETS;
const { FLOAT } = GL_DATA_TYPES;
const { STATIC_DRAW } = GL_BUFFER_USAGES;

import { object, array } from './lib/fp/index.js';
const { forEach } = object;
const { push } = array;

const shaderIDs = ['shader-fs', 'shader-vs'];
const glConfig = {
	buffers: [
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
	],

	// TODO: make this an array of objects that will have stuff like the 
	// data type and maybe the function for sending the data to the GPU
	// (e.g. uniformMatrix4fv)
	uniforms: [
		'modelViewMatrix',
		'projectionMatrix',
	]
};

import {
	toPerspectiveProjectionMatrix,
	toOrthographicProjectionMatrix,
	lookAt,
	flatten,
	toIdentityMatrix,
	multiply,
	toTranslationMatrix,
	toRotationMatrix,
	toScaleMatrix,
} from './lib/matrices.js';

const toRender = (gl, program) => {
	let rot = 0;

	const render = () => {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);

		const projectionMatrix = toPerspectiveProjectionMatrix(60, 4 / 3, 1, 1000);
		gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), false, new Float32Array(flatten(projectionMatrix)));

		const eye = [1, Math.cos(rot), 1];
		const at = [Math.sin(rot), 0, 0];
		const up = [0, 1, 0];
		// let modelViewMatrix = lookAt(eye, at, up);
		// let modelViewMatrix = toTranslationMatrix(0, 0, 1);
		let modelViewMatrix = multiply(lookAt(eye, at, up), toTranslationMatrix(0, 0, 2));
		gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelViewMatrix'), false, new Float32Array(flatten(modelViewMatrix)));
		// gl.drawArrays(gl.TRIANGLES, 0, 18);
		gl.drawArrays(gl.TRIANGLES, 0, 18);

		// modelViewMatrix = multiply(toIdentityMatrix(4), toScaleMatrix(4)(scale, scale, scale), toRotationMatrix(-rot, 1, 1, 1), toTranslationMatrix(5, 0, 10));
		// gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelViewMatrix'), false, new Float32Array(flatten(modelViewMatrix)));
		// gl.drawArrays(gl.TRIANGLES, 0, 36);

		rot += 0.01;
		setTimeout(() => window.requestAnimationFrame(render), 5);
	};

	return render;
};

const pushPoints = (...vals) => push(...vals.flat());
const toGeneratePrimitive = buffers => config => forEach((updateData, updateName, updates) => config[updateName](updateData, updates)(buffers[updateName].data));

const main = () => {
	const screen = document.getElementById('screen');
	const gl = screen.getContext('webgl2');

	const [program, buffers] = toInitGL(gl)(shaderIDs, glConfig);
	const { vertices, colors } = buffers;

	const color = {
		white: [1, 1, 1, 1],
		red: [1, 0, 0, 1],
		green: [0, 1, 0, 1],
		blue: [0, 0, 1, 1],
		yellow: [1, 1, 0, 1],
		purple: [1, 0, 1, 1],
	};

	const generatePrimitive = toGeneratePrimitive({ vertices, colors });
	const generateTriangle = generatePrimitive({ 
		vertices: ([a, b, c]) => pushPoints(a, b, c),
		colors: ([a, b, c]) => pushPoints(a, b, c),
	});
	const generateQuad = generatePrimitive({
		vertices: ([a, b, c, d]) => pushPoints(a, b, c, a, c, d),
		colors: ([a, b, c, d]) => pushPoints(a, b, c, a, c, d)
	});

	// Make a pyramid
	generateTriangle({ vertices: [[1, -1, 1], [0, 1, 0], [-1, -1, 1]], colors: Array(4).fill(color.white) }); // front: white
	generateTriangle({ vertices: [[1, -1, -1], [0, 1, 0], [1, -1, 1]], colors: Array(4).fill(color.red) }); // right: red
	generateTriangle({ vertices: [[-1, -1, -1], [0, 1, 0], [1, -1, -1]], colors: Array(4).fill(color.green) }); // back: green
	generateTriangle({ vertices: [[-1, -1, 1], [0, 1, 0], [-1, -1, -1]], colors: Array(4).fill(color.blue) }); // left: blue
	generateQuad({ vertices: [[1, -1, -1], [-1, -1, -1], [-1, -1, 1], [1, -1, 1]], colors: Array(4).fill(color.yellow) }); // bottom: yellow

	// make a cube
	// generateQuad({ vertices: [[1, -1, 1], [1, 1, 1], [-1, 1, 1], [-1, -1, 1]], colors: [color.white, color.white, color.white, color.white] }); // front face: white
	// generateQuad({ vertices: [[1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, -1]], colors: [color.red, color.red, color.red, color.red] }); // back face: red
	// generateQuad({ vertices: [[1, 1, 1], [1, 1, -1], [-1, 1, -1], [-1, 1, 1]], colors: [color.green, color.green, color.green, color.green] }); // top face: green
	// generateQuad({ vertices: [[1, -1, 1], [1, -1, -1], [-1, -1, -1], [-1, -1, 1]], colors: [color.blue, color.blue, color.blue, color.blue] }); // bottom face: blue
	// generateQuad({ vertices: [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]], colors: [color.yellow, color.yellow, color.yellow, color.yellow] }); // right face: yellow
	// generateQuad({ vertices: [[-1, -1, -1], [-1, 1, -1], [-1, 1, 1], [-1, -1, 1]], colors: [color.purple, color.purple, color.purple, color.purple] }); // left face: purple

	gl.bindBuffer(vertices.glTarget, vertices.glBuffer);
	gl.bufferData(vertices.glTarget, new vertices.type(vertices.data), vertices.usage);

	gl.bindBuffer(colors.glTarget, colors.glBuffer);
	gl.bufferData(colors.glTarget, new colors.type(colors.data), colors.usage);

	const render = toRender(gl, program);
	render();
};

window.onload = main;
