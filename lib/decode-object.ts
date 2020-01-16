import {
	InvalidJsonError,
	decodeObject as original,
} from '@batterii/encode-object';
import { InvalidTokenError } from './invalid-token-error';
import { is } from 'nani';

/**
 * An internal function that simply wraps @batterii/encode-object for error
 * handling purposes.
 * @param str - A string containing an object to decode.
 * @returns The decoded object.
 */
export function decodeObject(str: string): any {
	try {
		return original(str);
	} catch (err) {
		if (!is(err, InvalidJsonError)) throw err;
		throw new InvalidTokenError('Invalid JSON in token', err);
	}
}
