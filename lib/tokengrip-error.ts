import {BatteriiError} from "@batterii/errors";

/**
 * Base class for all errors defined by this package.
 *
 * @remarks
 * This class, as well as all other error classes in this project, inherits from
 * [NaniError](https://sripberger.github.io/nani/#nanierror) and may use any of
 * the constructor arguments of that class.
 */
export class TokengripError extends BatteriiError {}
