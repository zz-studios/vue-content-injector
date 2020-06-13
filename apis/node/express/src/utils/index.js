export const isFunction = (functionToCheck) => {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export const isPromise = (functionToCheck) => {
	return functionToCheck && isFunction(functionToCheck.then);
}

// TODO this one is updated, move to other places!
export const wrapInPromise = (functionToCheck) =>
	isPromise(functionToCheck) ? functionToCheck  // it's a Promise, so just use that Promise
		: isFunction(functionToCheck) ? async (...args) => functionToCheck.apply(this, args) // it's a function, so wrap it in a Promise
			: async () => functionToCheck // it's something else, so wrap it in a Promise

