const reduce = (fn, initialValue, keySelector = Object.keys) => o => 
{
	const keys = keySelector(o);
	return keys.reduce((acc, k) => fn(acc, o[k], k, o), initialValue);
};

const map = fn => reduce((acc, v, k, o) => ({...acc, [k]: fn(v, k, o)}), {});
const mapKeys = fn => reduce((acc, v, k, o) => ({...acc, [fn(v, k, o)]: v}), {});
