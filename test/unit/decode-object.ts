import * as encodeObjectModule from '@batterii/encode-object';
import * as nani from 'nani';
import { InvalidTokenError } from '../../lib/invalid-token-error';
import { decodeObject } from '../../lib/decode-object';
import { expect } from 'chai';
import sinon from 'sinon';

describe('decodeObject', function() {
	const str = 'some string';
	let obj: any;
	let original: sinon.SinonStub;
	let is: sinon.SinonStub;

	beforeEach(function() {
		obj = {};
		original = sinon.stub(encodeObjectModule, 'decodeObject').returns(obj);
		is = sinon.stub(nani, 'is').returns(true);
	});

	it('wraps the original decodeObject function', function() {
		const result = decodeObject(str);

		expect(original).to.be.calledOnce;
		expect(original).to.be.calledWith(str);
		expect(result).to.equal(obj);
	});

	context('original function throws', function() {
		let error: Error;

		beforeEach(function() {
			error = new Error('omg bad error');
			original.throws(error);
		});

		it('checks if a thrown error is an InvalidJsonError', function() {
			try {
				decodeObject(str);
			} catch (_err) {
				// For this test, We don't care whether this throws or not.
			}

			expect(is).to.be.calledOnce;
			expect(is).to.be.calledWith(
				error,
				encodeObjectModule.InvalidJsonError,
			);
		});

		it('wraps InvalidJsonErrors with InvalidTokenErrors', function() {
			expect(() => {
				decodeObject(str);
			}).to.throw(InvalidTokenError).that.includes({
				shortMessage: 'Invalid JSON in token',
				cause: error,
				info: null,
			});
		});

		it('rethrows all other errors', function() {
			is.returns(false);

			expect(() => {
				decodeObject(str);
			}).to.throw(error);
		});
	});
});
