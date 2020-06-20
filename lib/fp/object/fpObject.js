export const reduce = (fn, initialValue, keySelector = Object.keys) => o => 
{
	const keys = keySelector(o);
	return keys.reduce((acc, k) => fn(acc, o[k], k, o), initialValue);
};

export const map = fn => reduce((acc, v, k, o) => ({...acc, [k]: fn(v, k, o)}), {});
export const mapKeys = fn => reduce((acc, v, k, o) => ({...acc, [fn(v, k, o)]: v}), {});
export const filter = pred => reduce((acc, v, k, o) => pred(v, k, o) ? {...acc, [k]: v} : acc);
export const forEach = fn => reduce((_, v, k, o) => fn(v, k, o));

// TODO: update so we don't have to reverse
export const pluck = (...path) => path.reverse().reduce((fn, key) => o => o[key] && fn(o[key]), path.length ? x => x : () => undefined);
export const pick = (...keys) => o => keys.reduce((acc, key) => ({...acc, [key]: o[key]}), {});

// This doesn't use the object reduce or object filter since we want to early bail as soon as we find something passing the predicate
export const find = pred => o => 
{
	const key = Object.keys(o).find(k => pred(o[k], k, o));
	return key ? {[key]: o[key]} : undefined;
};
