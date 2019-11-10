import { NaniError } from 'nani';
import { TokengripError } from '../../lib/tokengrip-error';
import { expect } from 'chai';

describe('TokengripError', function() {
	it('extends NaniError', function() {
		expect(new TokengripError()).to.be.an.instanceOf(NaniError);
	});
});
