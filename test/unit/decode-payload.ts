import * as decodeObjectModule from '../../lib/decode-object';
import { decodePayload } from '../../lib/decode-payload';
import { expect } from 'chai';
import sinon from 'sinon';

describe('decodePayload', function() {
	it('returns the decoded payload of the provided token', function() {
		const payload = 'encoded payload';
		const token = `encoded header.${payload}.signature`;
		const decoded = {};
		const decodeObject = sinon.stub(decodeObjectModule, 'decodeObject')
			.returns(decoded);

		const result = decodePayload(token);

		expect(decodeObject).to.be.calledOnce;
		expect(decodeObject).to.be.calledWith(payload);
		expect(result).to.equal(decoded);
	});
});
