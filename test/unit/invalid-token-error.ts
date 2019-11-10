import { InvalidTokenError } from '../../lib/invalid-token-error';
import { TokengripError } from '../../lib/tokengrip-error';
import { expect } from 'chai';

describe('InvalidTokenError', function() {
	it('extends TokengripError', function() {
		expect(new InvalidTokenError()).to.be.an.instanceOf(TokengripError);
	});
});
