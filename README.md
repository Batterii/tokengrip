# @batterii/tokengrip
Similar to [Keygrip][1], this library helps create and verify digital signatures
using a rotating credential system. Unlike Keygrip, however, it produces
self-contained JWT-like tokens which contain the signing algorthm, a
JSON-encoded payload, and the signature itself.


## Tokengrip tokens not JWT's
Although they are similar to JWT's, the tokens created by Tokengrip are
deliberately *not* compliant with the [JWT standard][2]. This standard is
massively complex and intended to handle use cases far beyond what is required
for simple symmetrically-signed authentication tokens.

Most notably, Tokengrip does not use the same algorithm specifiers, instead
using those consumed by Node's [crypto.createHmac][3] function. It also does not
concern itself with any aysmmetric signing algorithms, built-in expiration
times, or any of the other 'standard claims' of JWT.


## Rationale
Keygrip is nice, but unless you are using it with [Cookies][4] to automatically
sign, verify, and update HTTP cookies using the `signed: true` option, it leaves
a bit of work for you.

Most trivially, since it returns signatures that do not include the signed data,
it is up to you to either join these and split them later, or to provide both to
your clients, who must send both with future requests. The Cookies module uses
the latter approach by setting the signature as a second cookie with the same
name as the signed cookie, except with the suffix `.sig`. Tokengrip solves this
problem the former way.

Less trivially, while Keygrip allows you to change your keys in a rotating
fashion, it does *not* allow you to change signing algorithms in the same way.
Once a Keygrip signature is created, there is no way of knowing what algorithm
was used to create it besides trying all of the supported algorithms one-by-one.
Tokengrip solves this by including the signing algorithm in a token header--
similar to how JWT's do it.

Finally, Cookies has a nice feature which uses Keygrip's `#index` method to
detect when a signature was created with an outdated key, and automatically
replace the signature using the newest key every time you fetch a signed cookie.
Without this feature, valid signatures would eventually become invalid, no
matter how frequently they are used in requests, which obviously defeats the
purpose of using Keygrip in the first place.

Tokengrip aims to reproduce this feature within its own API. Its `#verify`
method will perform this check and include a replacement token in its return
value, if and only if such a replacement is necessary. This allows you to
perform the replacement in whatever way is appropriate. If you are storing your
tokens in a cookie, simply overwrite the cookie. If you are leaving it to your
clients to store their tokens, you can simply send it as a response header.


## API
**grip = new TokenGrip([keys],[algorithms])**

This creates a new Tokengrip instance with the provided keys and algorithms.
Either argument can be provided as a single string or an array of strings.
`keys` defaults to an empty array, and `algorithms` defaults to `'sha1'`.

**grip.keys**

You can edit this property as you see fit to change the keys in your instance--
mutate it with `unshift` and `pop` or replace it entirely by assigning over it.

**grip.algorithms**

Same as `grip.keys`, except changing it affects the signing algorithms allowed
by the instance.

**token=grip.sign(payload)**

Creates a new token with the provided payload, which must be a valid argument
to `JSON.stringify`. The token will be signed using the first key and the
first algorithm.

**{ payload, newToken } = grip.verify(token)**

Consumes a token, returning its payload as the `payload` property of the result.
If the token was signed with an outdated key or algorithm, the result will also
have a new`newToken` property, which will be a new token with the same payload,
except re-signed with the newest key and algorithm. This method will throw if
verfication fails with all keys, or if the token is simply invalid due to an
unsupported algorithm or invalid JSON.

**payload = decodePayload(token)**

Extracts the decoded payload of a token, without checking the signature. This
should only be used if it is helpful to know something about the token before
the signature is checked-- an expiration date, for example, so you know if the
token is expired before you even bother with verifying it.

Data extracted this way should *not* be trusted until the signature is checked.

**newToken = grip.checkSignature(token)**

This is similar to `grip#verify`, except that it does not decode the payload.
Like `grip#verify` it returns a new token if one is needed. It will return
`null` otherwise.

This method is useful for checking a signature after you've already decoded the
payload using `decodePayload`. `grip#verify` is simply a combination of both of
these operations, since the majority of the time you'll want to be doing both.


## Error Handling
Tokengrip uses [Nani][5] to create the errors it throws, allowing you to easily
identify them using the `is` function. Three error classes are exported:

- `TokengripError`: This is the base class of all of the following errors for
  namespacing purposes.

- `InvalidStateError`: Will be thrown when an attempt is made to sign or verify
  a token when either the keys or algorithms arrays are empty. If you catch one
  of these, you should probably re-throw it, as it indicates a mistake on the
  part of the developer-- for example, popping out too many keys for failing to
  provide any to begin with.

- `InvalidTokenError`: Will be thrown when a token is provided that is not
  valid. This can be due to the token having been tampered with, or having been
  signed by a key or alorithm that is no longer allowed by the Tokengrip
  instance.

- `InvalidSignatureError`: A subtype of `InvalidTokenError`, indicating
  specifically that the signature was checked against all of the keys and did
  not match with any of them. This can happen if the token was tampered with,
  or if it was originally signed by a key that is no longer in the instance.
  Unlike a base `InvalidTokenError`, though, you can rule out a disallowed
  alogrithm, or that a string was provided that simply isn't a Tokengrip token.


## Example
```js
import { Tokengrip, InvalidTokenError } from 'tokengrip';
import { is } from 'Nani';

// Create the instance and store it somewhere.
const grip = new Tokengrip(
	[ 'seeecrat', 'wow another seecrat' ],
	[ 'sha256', 'sha1' ],
);

// ...

// In your login endpoint:
const token = grip.sign({ foo: 'bar' });
// Give the token to the client in cookie, header, or response body...

// ...

// In your api middleware:
let payload;
let newToken;

try {
	// Get the token from the request and verify it.
	({ payload, newToken } = grip.verify(token));
} catch (err) {
	if (is(err, InvalidTokenError)) {
		// Should cause a 401 or whatever is appropriate for your API.
		throw MyCustomError();
	} else {
		// Rethrow any other errors.
		throw err;
	}
}

// Do whatever is needed with the payload....

if (newToken) {
	// Give the new token to the client...
}

```


[1]: https://www.npmjs.com/package/keygrip
[2]: https://tools.ietf.org/html/rfc7519
[3]: https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key_options
[4]: https://www.npmjs.com/package/cookies
[5]: https://www.npmjs.com/package/nani
