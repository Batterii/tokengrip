import {Signable} from "../../lib/signable";
import base64url from "base64url";
import crypto from "crypto";
import {expect} from "chai";
import sinon from "sinon";

describe("Signable", function() {
	const algorithm = "some algorithm";
	const data = "signed data";
	let signable: Signable;

	beforeEach(function() {
		signable = new Signable(algorithm, data);
	});

	it("stores provided algorithm string", function() {
		expect(signable.algorithm).to.equal(algorithm);
	});

	it("stores provided data string", function() {
		expect(signable.data).to.equal(data);
	});

	describe("#sign", function() {
		const key = "some key";
		const digest = Buffer.from("digest result");
		const encoded = "encoded result";
		let hmac: sinon.SinonStubbedInstance<crypto.Hmac>;
		let createHmac: sinon.SinonStub;
		let encode: sinon.SinonStub;
		let result: string;

		beforeEach(function() {
			hmac = sinon.stub(crypto.createHmac("sha1", "some key"));
			hmac.update.returnsThis();
			hmac.digest.returns(digest as any);
			createHmac = sinon.stub(crypto, "createHmac").returns(hmac as any);
			encode = sinon.stub(base64url, "encode").returns(encoded);

			result = signable.sign(key);
		});

		it("creates an hmac with the provided algorithm and key", function() {
			expect(createHmac).to.be.calledOnce;
			expect(createHmac).to.be.calledWithExactly(algorithm, key);
		});

		it("updates the hmac with the data", function() {
			expect(hmac.update).to.be.calledOnce;
			expect(hmac.update).to.be.calledOn(hmac);
			expect(hmac.update).to.be.calledWithExactly(data);
		});

		it("creates a buffer digest from the updated hmac", function() {
			expect(hmac.digest).to.be.calledOnce;
			expect(hmac.digest).to.be.calledOn(hmac);
			expect(hmac.digest).to.be.calledWithExactly();
			expect(hmac.digest).to.be.calledAfter(hmac.update);
		});

		it("encodes the buffer digest using base64url", function() {
			expect(encode).to.be.calledOnce;
			expect(encode).to.be.calledWithExactly(digest);
		});

		it("returns the encoded digest", function() {
			expect(result).to.equal(encoded);
		});
	});
});
