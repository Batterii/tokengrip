import * as signableModule from '../../lib/signable';
import { createToken } from '../../lib/create-token';
import { expect } from 'chai';
import sinon from 'sinon';

type Signable = signableModule.Signable;

describe('createToken', function() {
	const algorithm = 'some algorithm';
	const data = 'full data string';
	const signature = 'signature';
	const key = 'some key';
	let signable: sinon.SinonStubbedInstance<Signable>;
	let Signable: sinon.SinonStub;
	let result: string;

	beforeEach(function() {
		signable = sinon.createStubInstance(signableModule.Signable);
		signable.sign.returns(signature);
		Signable = sinon.stub(signableModule, 'Signable')
			.returns(signable);

		result = createToken(algorithm, key, data);
	});

	it('creates a new signable with the provided algorithm and data string', function() {
		expect(Signable).to.be.calledOnce;
		expect(Signable).to.calledWithNew;
		expect(Signable).to.calledWith(algorithm, data);
	});

	it('signs the signable using the provided key', function() {
		expect(signable.sign).to.be.calledOnce;
		expect(signable.sign).to.be.calledOn(signable);
		expect(signable.sign).to.be.calledWith(key);
	});

	it('returns the dot-separated data string and signature', function() {
		expect(result).to.equal(`${data}.${signature}`);
	});
});
