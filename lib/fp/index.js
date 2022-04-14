import * as array from './array/fpArray.js';
export { array };

import * as object from './object/fpObject.js';
export { object };

export const pipe = (...transformations) => data => transformations.reduce((transformedData, transformation) => transformation(transformedData), data);
