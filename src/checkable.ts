import {Signable} from "./signable";
import tsscmp from "tsscmp";

/**
 * Encapsulates a signature and a signable, allowing for easy signature
 * checking against various keys.
 */
export class Checkable {
	/**
	 * Signature that will be checked.
	 */
	signature: string;

	/**
	 * Signable instance used to create verification signatures.
	 */
	signable: Signable;

	/**
	 * Creates an instance of Checkable.
	 * @param signature - Signature to perform checks against.
	 * @param algorithm - Algorithm with which to perform checks.
	 * @param data - Data string to perform checks against.
	 */
	constructor(signature: string, algorithm: string, data: string) {
		this.signature = signature;
		this.signable = new Signable(algorithm, data);
	}

	/**
	 * Checks the signature with the provided key.
	 * @param key - The key with which to perform the check.
	 * @returns `true` if the signature matches the signable, `false` otherwise.
	 */
	check(key: string): boolean {
		return tsscmp(this.signable.sign(key), this.signature);
	}
}
