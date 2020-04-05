import * as array from './array/fpArray';
export { array };

import * as object from './object/fpObject';
export { object };

export const pipe = (...transformations) => data =>
	transformations.reduce((transformedData, transformation) => transformation(transformedData), data);
