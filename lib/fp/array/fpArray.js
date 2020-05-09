// TODO: Make this not so state-mutative
export const zip = (...arrays) => arrays.reduce((zipped, array) => (array.forEach((v, i) => zipped[i] = [...(zipped[i] || []), v]), zipped), []);
