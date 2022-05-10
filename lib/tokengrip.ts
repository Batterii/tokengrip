import {castArray, isEmpty, isString} from "lodash";
import {Checkable} from "./checkable";
import {InvalidSignatureError} from "./invalid-signature-error";
import {InvalidStateError} from "./invalid-state-error";
import {InvalidTokenError} from "./invalid-token-error";
import {createToken} from "./create-token";
import {decodeObject} from "./decode-object";
import {decodePayload} from "./decode-payload";
import {encodeObject} from "@batterii/encode-object";

/**
 * Interface for results of Tokengrip#verify calls.
 */
export interface VerifyResult {
	/**
	 * The decoded and parsed payload.
	 */
	payload: any;

	/**
	 * A new token that should be used replace the verified one in future
	 * #verify callls. This will be set if and only it the verified one is
	 * signed with an outdated key or algorithm.
	 */
	newToken?: string;
}

/**
 * Encapsulates a set of keys and algorithms which may be used to create and
 * verify 'Tokengrip' tokens.
 */
export class Tokengrip {
	/**
	 * The array of permitted keys.
	 *
	 * @remarks
	 * This array can be mutated or replaced entirely by assignment, though it
	 * must not be empty when calling `#sign` or `#verify`.
	 *
	 * The first key will be used to create signatures, while any others will be
	 * considered decprecated but still permitted.
	 */
	keys: string[];

	/**
	 * The array of permitted algorithms.
	 *
	 * @remarks
	 * This array can be mutated or replaced entirely by assignment, though it
	 * must not be empty when calling `#sign` or `#verify`. Provided algorithms
	 * must be supported by Node's `crypto.createHmac` function.
	 *
	 * The first algorithm will be used to create signatures, while any others
	 * will be considered oudated but still permitted.
	 */
	algorithms: string[];

	/**
	 * Creates an instance of Tokengrip.
	 * @param keys - A single key or array of keys.
	 * @param algorithms - A single algorithm or array of algorithms. Defaults
	 *   to 'sha1'.
	 */
	constructor(
		keys: string|string[] = [],
		algorithms: string|string[] = "sha1",
	) {
		this.keys = castArray(keys);
		this.algorithms = castArray(algorithms);
	}

	/**
	 * Creates a new token with the provided payload data.
	 *
	 * @remarks
	 * This method will throw if there is not at least one key and at least one
	 * algorithm stored in the instance.
	 *
	 * @param payload - Payload data for the token.
	 * @returns The created token.
	 */
	sign(payload: any): string {
		this._validate();
		return this._createToken(encodeObject(payload));
	}

	/**
	 * Verifies a token's signature and returns its payload, as well as a
	 * replacement token if one is necessary.
	 *
	 * @remarks
	 * A replacement token will be included in the result as the `newToken`
	 * property if and only if the provided token is outdated due to a change
	 * in the 'keys' and/or 'algorithms' properties. Switching from the provided
	 * token to the new one as soon as possible will ensure clients can always
	 * have a valid token, as long as they haven't been inactive for an entire
	 * key or algorithm lifecyle.
	 *
	 * This method may throw any of the following errors:
	 * - InvalidStateError: If the is not at least one key and at least one
	 *   algorithm stored in the Tokengrip instance.
	 * - InvalidSignatureError: If the signature of the token does not match
	 *   using one of the instance's keys.
	 * - InvalidTokenError: If the token's header is not a valid Tokengrip
	 *   header with an algorithm supported by the instance, or if the payload
	 *   contains invalid JSON.
	 *
	 * @param token - The token to verify.
	 * @returns A plain object implementing VerifyResult.
	 */
	verify(token: string): VerifyResult {
		const newToken = this.checkSignature(token);
		const result = {payload: decodePayload(token)} as VerifyResult;
		if (newToken) result.newToken = newToken;
		return result;
	}

	/**
	 * Checks the signature of the token without decoding the payload. Returns
	 * a replacement token if one is necessary.
	 *
	 * @remarks
	 * This method is the same as #verify, except that it doesn't bother
	 * decoding and returning the payload. It is useful for situations where
	 * you either don't care about the payload, or have already decoded it
	 * yourself using the 'decodePayload` function.
	 *
	 * This method may throw any of the following errors:
	 * - InvalidStateError: If the is not at least one key and at least one
	 *   algorithm stored in the Tokengrip instance.
	 * - InvalidSignatureError: If the signature of the token does not match
	 *   using one of the instance's keys.
	 * - InvalidTokenError: If the token's header is not a valid Tokengrip
	 *   header with an algorithm supported by the instance.
	 * @param token - The token to check.
	 * @returns A new token, if one is required. `null` otherwise.
	 */
	checkSignature(token: string): string|null {
		const [header, payload, signature] = token.split(".");
		this._validate();
		const algorithm = this._getAlgorithm(header);
		const data = `${header}.${payload}`;
		const checkable = new Checkable(signature, algorithm, data);
		let expired = algorithm !== this.algorithms[0];
		for (const key of this.keys) {
			if (checkable.check(key)) {
				return expired ? this._createToken(payload) : null;
			}
			expired = true;
		}
		throw new InvalidSignatureError();
	}

	/**
	 * Ensures the instance is in a valid state for creating or verifying
	 * tokens. Will throw if it is not.
	 */
	private _validate(): void {
		if (isEmpty(this.keys)) {
			throw new InvalidStateError("keys array is empty");
		}
		if (isEmpty(this.algorithms)) {
			throw new InvalidStateError("algorithms array is empty");
		}
	}

	/**
	 * Creates a new token with the provided (already encoded) payload string.
	 * @param payload - Encoded payload.
	 * @returns The created token.
	 */
	private _createToken(payload: string): string {
		const [algorithm] = this.algorithms;
		const header = encodeObject({typ: "Tokengrip", alg: algorithm});
		return createToken(algorithm, this.keys[0], `${header}.${payload}`);
	}

	/**
	 * Validates the provided encoded header string and extracts the algorithm
	 * from it. Also ensures the alorithm is allowed by this instance.
	 * @param header - Encoded header.
	 * @returns The header's `alg` field.
	 */
	private _getAlgorithm(header: string): string {
		const {alg: algorithm, typ: type} = decodeObject(header);
		if (type !== "Tokengrip") {
			throw new InvalidTokenError("Token is not a Tokengrip token");
		}
		if (!isString(algorithm) || !this.algorithms.includes(algorithm)) {
			throw new InvalidTokenError(
				`Algorithm '${algorithm}' is not allowed`,
				{info: {algorithm}},
			);
		}
		return algorithm;
	}
}
