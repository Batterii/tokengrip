import { decodeObject } from './decode-object';

/**
 * Decodes and returns a token's payload, without checking the signature.
 *
 * @remarks
 * This function is useful if you want to know some information about a token
 * before you check its signature. Data extracted this way should *not* be
 * trusted until you use later use a Tokengrip instance to actually verify it.
 *
 * The Tokengrip instance provides the `#checkSignature` method which can
 * be used for this purpose, without bothering to decode the payload all over
 * again.
 *
 * This function will throw an InvalidTokenError if the token's payload contains
 * invalid JSON.
 *
 * @param token - The token to decode.
 * @returns The decoded payload.
 */
export function decodePayload(token: string): any {
	return decodeObject(token.split('.')[1]);
}
