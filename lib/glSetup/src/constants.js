export const SHADERTYPE_VERTEX = 'x-shader/x-vertex';
export const SHADERTYPE_FRAGMENT = 'x-shader/x-fragment';

export const GL_DATA_TYPES = {
	BYTE: 'BYTE',
	SHORT: 'SHORT',
	UNSIGNED_BYTE: 'UNSIGNED_BYTE',
	UNSIGNED_SHORT: 'UNSIGNED_SHORT',
	FLOAT: 'FLOAT',

	// webgl2 only
	HALF_FLOAT: 'HALF_FLOAT'
};

export const GL_BUFFER_TARGETS = {
	ARRAY_BUFFER: 'ARRAY_BUFFER',
	ELEMENT_ARRAY_BUFFER: 'ELEMENT_ARRAY_BUFFER',

	// webgl2 only
	COPY_READ_BUFFER: 'COPY_READ_BUFFER',
	COPY_WRITE_BUFFER: 'COPY_WRITE_BUFFER',
	TRANSFORM_FEEDBACK_BUFFER: 'TRANSFORM_FEEDBACK_BUFFER',
	UNIFORM_BUFFER: 'UNIFORM_BUFFER',
	PIXEL_PACK_BUFFER: 'PIXEL_PACK_BUFFER',
	PIXEL_UNPACK_BUFFER: 'PIXEL_UNPACK_BUFFER',
};