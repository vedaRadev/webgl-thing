export const toLookupFn = dictionary => 
	keyToFind => 
	{
		const [, value] = dictionary.find(([key]) => key === keyToFind) || [];
		return value;
	}

export const withPredicatedWarning = (pred, toWarningMessage) => 
	(fn = x => x) =>
		(...fnParams) =>
		{
			const result = fn(...fnParams);
			if (pred(result)) console.warn(toWarningMessage(...fnParams));
			return result;
		};
