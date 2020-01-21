import { InvalidSignatureError } from '../../lib/invalid-signature-error';
import { InvalidTokenError } from '../../lib/invalid-token-error';
import { expect } from 'chai';

describe('InvalidSignatureError', function() {
	it('extends InvalidTokenError', function() {
		expect(new InvalidSignatureError())
			.to.be.an.instanceOf(InvalidTokenError);
	});

	describe('::getDefaultMessage', function() {
		it('returns an appropriate message', function() {
			expect(InvalidSignatureError.getDefaultMessage()).to.equal(
				'Invalid signature',
			);
		});
	});
});
