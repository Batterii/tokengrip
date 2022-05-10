import {Signable} from "./signable";

/**
 * Creates a token with the provided data string.
 * @param algorithm - The algorithm to use when creating the signature.
 * @param key - The key to use when creating the signature.
 * @param data - Encoded data string, including both payload and header.
 */
export function createToken(
	algorithm: string,
	key: string,
	data: string,
): string {
	return `${data}.${new Signable(algorithm, data).sign(key)}`;
}
