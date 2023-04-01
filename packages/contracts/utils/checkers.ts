// check if a value is undefined or not
// throws error if value is undefined
export const checkForUndefined = (propertyName: string, value: any): void => {
	if (value === undefined) {
		throw Error(`${propertyName} is undefined.`);
	}
};
