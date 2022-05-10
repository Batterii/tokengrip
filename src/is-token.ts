import {decodeObject, InvalidJsonError} from "@batterii/encode-object";
import {is} from "nani";

/**
 * Checks whether a string is a Tokengrip token.
 * @param str The string to check.
 * @returns `true` if the string is a Tokengrip token, false otherwise.
 */
export function isToken(str: string): boolean {
	const [header] = str.split(".");
	if (!header) return false;

	let headerObj: Record<string, any>;
	try {
		headerObj = decodeObject(header);
	} catch (err) {
		if (is(err, InvalidJsonError)) return false;
		throw err;
	}

	return headerObj.typ === "Tokengrip";
}
