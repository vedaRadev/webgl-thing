export const and = (...preds) => val => preds.every(pred => pred(val));
export const or = (...preds) => val => preds.some(pred => pred(val));
export const not = pred => val => !pred(val);
export const isNil = val => val == undefined;
export const isObject = val => typeof val === 'object';
export const isString = val => typeof val === 'string';
