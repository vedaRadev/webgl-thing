const noop = () => {};

export const where = (fn, pred) => o => pred(fn(o));
export const and = (...preds) => val => preds.every(pred => pred(val));
export const or = (...preds) => val => preds.some(pred => pred(val));
export const not = pred => val => !pred(val);
export const isNil = val => val == undefined;
export const isObject = val => typeof val === 'object';
export const isFunction = val => typeof val === 'function';
export const isString = val => typeof val === 'string';
export const isNumber = val => typeof val === 'number';
export const isArray = Array.isArray;
export const isStrictlyEqualTo = a => b => a === b;

export const isOneOf = (...arr) => val => !!arr.find(isStrictlyEqualTo(val));

// TODO: move to utils
const defaultToEntries = dict => Object.entries(dict).map(tuple => tuple.reverse());
const withLookup = (dictionary, toValueIfNotFound = noop, toEntries = defaultToEntries) => 
{
	const lookup = isArray(dictionary) ? dictionary : toEntries(dictionary);
	return val =>
	{
		const [, result] = lookup.find(([pred]) => pred(val)) || [];
		return result || toValueIfNotFound(val);
	};
};

export const isSameTypeAs = (val, additionalTypeDictionary, valType) =>
{
	const toType = withLookup(additionalTypeDictionary, x => typeof x) || toJSType;
	const vType = valType || toType(val);
	return where(toType, isStrictlyEqualTo(vType));
};

const toShouldIgnoreEntryFn = ignoreValue => 
{
	// ignoreValue is an array of specified keys
	if (isArray(ignoreValue)) 
	{
		const pred = isOneOf(...ignoreValue.map(String));
		return (_, k) => pred(k);
	}

	if (or(isFunction, isNil)(ignoreValue)) return ignoreValue;

	throw new Error('Value of ignore must be a function or an array.');
};

export const checkEntries = (keyPredicateDictionary, { strict = true, rest, ignore } = {}) => 
{
	if (ignore && !rest) throw new Error('Must define "rest" if providing "ignore".');
	const toShouldIgnoreEntry = toShouldIgnoreEntryFn(ignore);
	const toPred = k => keyPredicateDictionary[k] || rest;

	return o =>
	{
		const objectKeys = Object.keys(o);

		if (strict && !Object.keys(keyPredicateDictionary).every(isOneOf(...objectKeys))) return false;

		if (!toShouldIgnoreEntry && !rest) return Object.entries(keyPredicateDictionary).every(([key, pred]) => pred(o[key], key, o));
		return objectKeys.every(key => ignore && toShouldIgnoreEntry(o[key], key, o) || toPred(key)(o[key], key, o));
	};
};
