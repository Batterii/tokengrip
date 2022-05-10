import {decodeObject, InvalidJsonError} from "@batterii/encode-object";
import {is} from "nani";

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
