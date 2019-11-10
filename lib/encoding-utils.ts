import { InvalidTokenError } from './invalid-token-error';
import base64url from 'base64url';

/**
 * Stringifies an object to base64url-encoded JSON.
 * @param obj - Object to encode.
 * @returns The encoded object.
 */
export function encodeObject(obj: any): string {
	return base64url.encode(JSON.stringify(obj));
}

/**
 * Parses an object from base64url-encoded JSON.
 *
 * @remarks
 * This function will throw an InvalidTokenError if parsing fails.
 *
 * @param str - The encoded object.
 * @returns - The decoded object.
 */
export function decodeObject(str: string): any {
	/*
	 * Node's Buffer.from with 'base64' encoding supports base64url out of the
	 * box, so there is no need to use the library to decode it.
	 */
	const json = Buffer.from(str, 'base64').toString();
	try {
		return JSON.parse(json);
	} catch (err) {
		throw new InvalidTokenError('Invalid JSON in token', err);
	}
}
