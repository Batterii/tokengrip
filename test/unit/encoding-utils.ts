import { decodeObject, encodeObject } from '../../lib/encoding-utils';
import { InvalidTokenError } from '../../lib/invalid-token-error';
import base64url from 'base64url';
import { expect } from 'chai';
import sinon from 'sinon';

describe('encoding-utils', function() {
	describe('encodeObject', function() {
		it('stringifies and encodes the object using base64url', function() {
			const obj = { foo: 'bar' };
			const encoded = 'encoded object';
			const encode = sinon.stub(base64url, 'encode').returns(encoded);

			const result = encodeObject(obj);

			expect(encode).to.be.calledOnce;
			expect(encode).to.be.calledWithExactly('{"foo":"bar"}');
			expect(result).to.equal(encoded);
		});
	});

	describe('decodeObject', function() {
		const str = Buffer.from('{"foo":"bar"}').toString('base64');

		it('decodes from base64 and parses as JSON', function() {
			const result = decodeObject(str);

			expect(result).to.deep.equal({ foo: 'bar' });
		});

		it('wraps parsing errors with InvalidTokenError', function() {
			const err = new Error('omg parsing error');
			sinon.stub(JSON, 'parse').throws(err);

			expect(() => {
				decodeObject(str);
			}).to.throw(InvalidTokenError).that.includes({
				shortMessage: 'Invalid JSON in token',
				cause: err,
				info: null,
			});
		});
	});
});
