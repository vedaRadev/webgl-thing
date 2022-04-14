export const zip = (...arrays) => arrays.reduce((zipped, array) => (array.forEach((v, i) => zipped[i] = [...(zipped[i] || []), v]), zipped), []);
export const push = (...vals) => arr => Array.prototype.push.call(arr, ...vals);
