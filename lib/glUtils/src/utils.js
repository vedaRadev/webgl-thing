import { object } from '../../fp/index.js';
const { reduce } = object;

import { isNil } from '../../pred.js';
import { toLookupFn, withPredicatedWarning } from '../../utils.js';

import {
	GL_DATA_TYPES,
	GL_BUFFER_TARGETS,
	GL_BUFFER_USAGES,
	GL_DRAW_MODES,
} from './constants.js';

const toGLenum = gl => reduce((acc, v, k) => [...acc, [v, gl[k]]], []);

export const toDataType = gl => 
{
	const toInvalidGLDataTypeMessage = typeString => `${typeString} is not a valid webgl data type`;
	return withPredicatedWarning(isNil, toInvalidGLDataTypeMessage)(
		toLookupFn(toGLenum(gl)(GL_DATA_TYPES))
	);
};

export const toBufferTarget = gl =>
{
	const toInvalidGLBufferTargetMessage = targetString => `${targetString} is not a valid webgl buffer target`;
	return withPredicatedWarning(isNil, toInvalidGLBufferTargetMessage)(
		toLookupFn(toGLenum(gl)(GL_BUFFER_TARGETS))
	);
};

export const toBufferUsage = gl =>
{
	const toInvalidGLBufferUsageMessage = usageString => `${usageString} is not a valid webgl buffer usage`;
	return withPredicatedWarning(isNil, toInvalidGLBufferUsageMessage)(
		toLookupFn(toGLenum(gl)(GL_BUFFER_USAGES))
	);
};

export const toDrawMode = gl =>
{
	const toInvalidGLDrawModeMessage = modeString => `${modeString} is not a valid webgl draw mode`;
	return withPredicatedWarning(isNil, toInvalidGLDrawModeMessage)(
		toLookupFn(toGLenum(gl)(GL_DRAW_MODES))
	);
};
