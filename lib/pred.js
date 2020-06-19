const noop = () => {};

export const where = (fn, pred) => o => pred(fn(o));
export const and = (...preds) => val => preds.every(pred => pred(val));
export const or = (...preds) => val => preds.some(pred => pred(val));
export const not = pred => val => !pred(val);
export const isNil = val => val == undefined;
export const isObject = val => typeof val === 'object';
export const isString = val => typeof val === 'string';
export const isNumber = val => typeof val === 'number';
export const isArray = Array.isArray;
export const isStrictlyEqualTo = a => b => a === b;

const withLookup = dictionary => 
{
	const lookup = Object.entries(dictionary);
	return (toValueIfNotFound = noop) => val =>
	{
		const [result] = lookup.find(([, pred]) => pred(val)) || [];
		return result || toValueIfNotFound(val);
	};
};

const toJSType = val => typeof val;
export const isSameTypeAs = (val, additionalTypeDictionary, valType) =>
{
	const toType = withLookup(additionalTypeDictionary)(toJSType) || toJSType;
	const vType = valType || toType(val);
	return where(toType, isStrictlyEqualTo(vType));
};
