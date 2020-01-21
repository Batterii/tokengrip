import * as checkableModule from '../../lib/checkable';
import * as createTokenModule from '../../lib/create-token';
import * as decodeObjectModule from '../../lib/decode-object';
import * as encodeObjectModule from '@batterii/encode-object';
import { Tokengrip, VerifyResult } from '../../lib/tokengrip';
import { InvalidSignatureError } from '../../lib/invalid-signature-error';
import { InvalidStateError } from '../../lib/invalid-state-error';
import { InvalidTokenError } from '../../lib/invalid-token-error';
import { expect } from 'chai';
import sinon from 'sinon';

type Checkable = checkableModule.Checkable;

describe('Tokengrip', function() {
	it('stores the provided arrays of keys and algorithms', function() {
		const keys = [ 'foo', 'bar' ];
		const algorithms = [ 'baz', 'qux' ];

		const grip = new Tokengrip(keys, algorithms);

		expect(grip.keys).to.equal(keys);
		expect(grip.algorithms).to.equal(algorithms);
	});

	it('supports a single string algorithm', function() {
		const keys = [ 'foo', 'bar' ];
		const algorithm = 'baz';

		const grip = new Tokengrip(keys, algorithm);

		expect(grip.keys).to.equal(keys);
		expect(grip.algorithms).to.deep.equal([ algorithm ]);
	});

	it('supports a single string key', function() {
		const key = 'foo';
		const algorithms = [ 'bar', 'baz' ];

		const grip = new Tokengrip(key, algorithms);

		expect(grip.keys).to.deep.equal([ key ]);
		expect(grip.algorithms).to.equal(algorithms);
	});

	it('defaults to a single algorithm of sha1', function() {
		const keys = [ 'foo', 'bar' ];

		const grip = new Tokengrip(keys);

		expect(grip.keys).to.equal(keys);
		expect(grip.algorithms).to.deep.equal([ 'sha1' ]);
	});

	it('defaults to an empty keys array', function() {
		const grip = new Tokengrip();

		expect(grip.keys).to.deep.equal([]);
	});

	describe('#sign', function() {
		const encoded = 'encoded payload';
		const token = 'created token';
		let grip: Tokengrip;
		let payload: any;
		let validate: sinon.SinonStub;
		let encodeObject: sinon.SinonStub;
		let createToken: sinon.SinonStub;
		let result: string;

		beforeEach(function() {
			grip = new Tokengrip();
			payload = { foo: 'bar' };

			validate = sinon.stub(grip as any, '_validate');
			encodeObject = sinon.stub(encodeObjectModule, 'encodeObject')
				.returns(encoded);
			createToken = sinon.stub(grip as any, '_createToken')
				.returns(token);

			result = grip.sign(payload);
		});

		it('validates the instance', function() {
			expect(validate).to.be.calledOnce;
			expect(validate).to.be.calledOn(grip);
		});

		it('encodes the payload using encodeObject after validating', function() {
			expect(encodeObject).to.be.calledOnce;
			expect(encodeObject).to.be.calledWith(payload);
			expect(encodeObject).to.be.calledAfter(validate);
		});

		it('creates a token with the encoded payload', function() {
			expect(createToken).to.be.calledOnce;
			expect(createToken).to.be.calledWith(encoded);
		});

		it('returns the created token', function() {
			expect(result).to.equal(token);
		});
	});

	describe('#verify', function() {
		const header = 'encoded header';
		const payload = 'encoded payload';
		const signature = 'signature';
		const token = `${header}.${payload}.${signature}`;
		let grip: Tokengrip;
		let validate: sinon.SinonStub;
		let getAlgorithm: sinon.SinonStub;
		let checkable: sinon.SinonStubbedInstance<Checkable>;
		let Checkable: sinon.SinonStub;
		let verifyResult: VerifyResult;
		let getVerifyResult: sinon.SinonStub;

		beforeEach(function() {
			grip = new Tokengrip([ 'foo', 'bar' ], [ 'baz', 'qux' ]);
			validate = sinon.stub(grip as any, '_validate');
			getAlgorithm = sinon.stub(grip as any, '_getAlgorithm')
				.returns('baz');

			checkable = sinon.createStubInstance(checkableModule.Checkable);
			checkable.check.returns(true).withArgs('foo').returns(false);
			Checkable = sinon.stub(checkableModule, 'Checkable')
				.returns(checkable);

			verifyResult = {} as VerifyResult;
			getVerifyResult = sinon.stub(grip as any, '_getVerifyResult')
				.returns(verifyResult);
		});

		it('validates the instance', function() {
			grip.verify(token);

			expect(validate).to.be.calledOnce;
			expect(validate).to.be.calledOn(grip);
		});

		it('gets the algorithm from the header after validating', function() {
			grip.verify(token);

			expect(getAlgorithm).to.be.calledOnce;
			expect(getAlgorithm).to.be.calledWith(header);
			expect(getAlgorithm).to.be.calledAfter(validate);
		});

		it('creates a checkable with the signature, algorithm, and full data string', function() {
			const data = `${header}.${payload}`;

			grip.verify(token);

			expect(Checkable).to.be.calledOnce;
			expect(Checkable).to.be.calledWithNew;
			expect(Checkable).to.be.calledWith(signature, 'baz', data);
		});

		it('checks each key with the checker, in order', function() {
			grip.verify(token);

			expect(checkable.check).to.be.calledTwice;
			expect(checkable.check).to.always.be.calledOn(checkable);
			expect(checkable.check.args).to.deep.equal([
				[ 'foo' ],
				[ 'bar' ],
			]);
		});

		it('returns an expired verify result if first key fails', function() {
			const result = grip.verify(token);

			expect(getVerifyResult).to.be.calledOnce;
			expect(getVerifyResult).to.be.calledOn(grip);
			expect(getVerifyResult).to.be.calledWith(payload, true);
			expect(result).to.equal(verifyResult);
		});

		it('returns a non-expired verify result if the first key succeeds', function() {
			checkable.check.withArgs('foo').returns(true);

			const result = grip.verify(token);

			expect(getVerifyResult).to.be.calledOnce;
			expect(getVerifyResult).to.be.calledOn(grip);
			expect(getVerifyResult).to.be.calledWith(payload, false);
			expect(result).to.equal(verifyResult);
		});

		it('forces an expired verify result if the algorithm is not the first one', function() {
			checkable.check.withArgs('foo').returns(true);
			getAlgorithm.returns('qux');

			const result = grip.verify(token);

			expect(getVerifyResult).to.be.calledOnce;
			expect(getVerifyResult).to.be.calledOn(grip);
			expect(getVerifyResult).to.be.calledWith(payload, true);
			expect(result).to.equal(verifyResult);
		});

		it('throws if none of the keys succeed', function() {
			checkable.check.withArgs('bar').returns(false);

			expect(() => {
				grip.verify(token);
			}).to.throw(InvalidSignatureError).that.includes({
				usedDefaultMessage: true,
				cause: null,
				info: null,
			});
		});
	});

	describe('#_validate', function() {
		let grip: Tokengrip;

		beforeEach(function() {
			grip = new Tokengrip('some key');
		});

		it('throws invalid state if keys array is empty', function() {
			grip.keys = [];

			expect(() => {
				(grip as any)._validate();
			}).to.throw(InvalidStateError).that.includes({
				shortMessage: 'keys array is empty',
				info: null,
				cause: null,
			});
		});

		it('throws invalid state if algorithms array is empty', function() {
			grip.algorithms = [];

			expect(() => {
				(grip as any)._validate();
			}).to.throw(InvalidStateError).that.includes({
				shortMessage: 'algorithms array is empty',
				info: null,
				cause: null,
			});
		});

		it('does not throw if neither array is empty', function() {
			(grip as any)._validate();
		});
	});

	describe('#_createToken', function() {
		const payload = 'encoded payload';
		const header = 'encoded header';
		const token = 'created token';
		let grip: Tokengrip;
		let encodeObject: sinon.SinonStub;
		let createToken: sinon.SinonStub;
		let result: string;

		beforeEach(function() {
			grip = new Tokengrip([ 'foo', 'bar' ], [ 'baz', 'qux' ]);
			encodeObject = sinon.stub(encodeObjectModule, 'encodeObject')
				.returns(header);
			createToken = sinon.stub(createTokenModule, 'createToken')
				.returns(token);

			result = (grip as any)._createToken(payload);
		});

		it('creates an encoded header specifying the first algorithm', function() {
			expect(encodeObject).to.be.calledOnce;
			expect(encodeObject).to.be.calledWith({
				typ: 'Tokengrip',
				alg: 'baz',
			});
		});

		it('creates a token with the first algorithm, first key, and full data string', function() {
			const data = `${header}.${payload}`;

			expect(createToken).to.be.calledOnce;
			expect(createToken).to.be.calledWith('baz', 'foo', data);
		});

		it('returns the created token', function() {
			expect(result).to.equal(token);
		});
	});

	describe('#_getAlgorithm', function() {
		const header = 'encoded header';
		let grip: Tokengrip;
		let decodedHeader: any;
		let decodeObject: sinon.SinonStub;

		beforeEach(function() {
			grip = new Tokengrip([], [ 'foo', 'bar' ]);
			decodedHeader = { typ: 'Tokengrip', alg: 'foo' };
			decodeObject = sinon.stub(decodeObjectModule, 'decodeObject')
				.returns(decodedHeader);
		});

		it('decodes the header using decodeObject', function() {
			(grip as any)._getAlgorithm(header);

			expect(decodeObject).to.be.calledOnce;
			expect(decodeObject).to.be.calledWith(header);
		});

		it('returns the alg property from the decoded header', function() {
			const barHeader = 'bar header';
			decodeObject.withArgs(barHeader).returns({
				typ: 'Tokengrip',
				alg: 'bar',
			});

			expect((grip as any)._getAlgorithm(header)).to.equal('foo');
			expect((grip as any)._getAlgorithm(barHeader)).to.equal('bar');
		});

		it('throws if the typ property is not \'Tokengrip\'', function() {
			decodedHeader.typ = 'JWT';

			expect(() => {
				(grip as any)._getAlgorithm(header);
			}).to.throw(InvalidTokenError).that.includes({
				shortMessage: 'Token is not a Tokengrip token',
				cause: null,
				info: null,
			});
		});

		it('throws if alg is not in the algorithms array', function() {
			decodedHeader.alg = 'baz';

			expect(() => {
				(grip as any)._getAlgorithm(header);
			}).to.throw(InvalidTokenError).that.satisfies((err: any) => {
				expect(err.shortMessage).to.equal(
					'Algorithm \'baz\' is not allowed',
				);
				expect(err.cause).to.be.null;
				expect(err.info).to.deep.equal({ algorithm: 'baz' });
				return true;
			});
		});
	});

	describe('#_getVerifyResult', function() {
		const payload = 'encoded payload';
		const newToken = 'new token';
		let grip: Tokengrip;
		let decodedPayload: any;
		let decodeObject: sinon.SinonStub;
		let createToken: sinon.SinonStub;

		beforeEach(function() {
			grip = new Tokengrip();

			decodedPayload = { foo: 'bar' };
			decodeObject = sinon.stub(decodeObjectModule, 'decodeObject')
				.returns(decodedPayload);

			createToken = sinon.stub(grip as any, '_createToken')
				.returns(newToken);
		});

		it('returns the decoded payload as a property', function() {
			const result = (grip as any)._getVerifyResult(payload, false);

			expect(decodeObject).to.be.calledOnce;
			expect(decodeObject).to.be.calledWith(payload);
			expect(createToken).to.not.be.called;
			expect(result).to.have.keys([ 'payload' ]);
			expect(result.payload).to.equal(decodedPayload);
		});

		it('also returns a new key, if expired was true', function() {
			const result = (grip as any)._getVerifyResult(payload, true);

			expect(decodeObject).to.be.calledOnce;
			expect(decodeObject).to.be.calledWith(payload);
			expect(createToken).to.be.calledOnce;
			expect(createToken).to.be.calledOn(grip);
			expect(createToken).to.be.calledWith(payload);
			expect(result).to.have.keys([ 'payload', 'newToken' ]);
			expect(result.payload).to.equal(decodedPayload);
			expect(result.newToken).to.equal(newToken);
		});
	});
});
