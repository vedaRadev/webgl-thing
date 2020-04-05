import { array } from './fp';

const { zip } = array;

const SHADERTYPE_VERTEX = 'x-shader/x-vertex';
const SHADERTYPE_FRAGMENT = 'x-shader/x-fragment';

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
	return (...attribNames) =>
	{
		const attribLocations = attribNames.map(toAttribLocation);
		attribLocations.forEach(loc => gl.enableVertexAttribArray(loc));
		zip(attribNames, attribLocations).forEach(([name, location]) => program[name] = location);
		return program;
	};
});

const toGLSetup = gl => gl && { 
	toGLShader: toShader(gl),
	toGLProgram: toProgram(gl)
};

export default toGLSetup;
