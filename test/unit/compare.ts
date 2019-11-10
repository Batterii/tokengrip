import { compare } from '../../lib/compare';
import { expect } from 'chai';
import tsscmp from 'tsscmp';

describe('compare', function() {
	it('is the function exported by tsscmp', function() {
		expect(compare).to.equal(tsscmp);
	});
});
