import base64url from 'base64url';
import { createHmac } from 'crypto';

/**
 * Encapsulates an algorithm and data string, allowing easy creation of
 * signatures using various keys.
 */
export class Signable {
	/**
	 * Algorithm with which to create signatures.
	 */
	algorithm: string;

	/**
	 * String data to be signed.
	 */
	data: string;


	/**
	 * Creates an instance of Signable.
	 * @param algorithm - Algorithm with which to create signatures.
	 * @param data - String data to be signed.
	 */
	constructor(algorithm: string, data: string) {
		this.algorithm = algorithm;
		this.data = data;
	}

	/**
	 * Creates a signature using the provided key.
	 * @param key - Key to use for the signature.
	 * @returns The created signature.
	 */
	sign(key: string): string {
		const hash = createHmac(this.algorithm, key)
			.update(this.data)
			.digest();

		return base64url.encode(hash);
	}
}
