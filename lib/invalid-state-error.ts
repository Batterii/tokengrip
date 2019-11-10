import { TokengripError } from './tokengrip-error';

/**
 * Error class for invalid Tokengrip state. These are thrown whenever an
 * operation is attempted with a Tokengrip instance that cannot be completed
 * due to the current state of the instance.
 */
export class InvalidStateError extends TokengripError {}
