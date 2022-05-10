import * as compareModule from "../../lib/compare";
import {Checkable} from "../../lib/checkable";
import {Signable} from "../../lib/signable";
import {expect} from "chai";
import sinon from "sinon";

describe("Checkable", function() {
	const signature = "some signature";
	const algorithm = "some algorithm";
	const data = "some data";
	let checkable: Checkable;
	let signable: Signable;

	beforeEach(function() {
		checkable = new Checkable(signature, algorithm, data);
		({signable} = checkable);
	});

	it("stores the provided signature", function() {
		expect(checkable.signature).to.equal(signature);
	});

	it("creates a signable with the provided algorithm and data", function() {
		expect(signable).to.be.an.instanceOf(Signable);
		expect(signable.algorithm).to.equal(algorithm);
		expect(signable.data).to.equal(data);
	});

	describe("#check", function() {
		const key = "some key";
		const otherKey = "some other key";
		const createdSignature = "created signature";
		const otherCreatedSignature = "other created signature";
		let sign: sinon.SinonStub;
		let compare: sinon.SinonStub;

		beforeEach(function() {
			sign = sinon.stub(signable, "sign").returns(otherCreatedSignature)
				.withArgs(key).returns(createdSignature);

			compare = sinon.stub(compareModule, "compare").returns(false);
			compare.withArgs(createdSignature, signature).returns(true);
		});

		it("signs the signable using the provided key", function() {
			checkable.check(key);

			expect(sign).to.be.calledOnce;
			expect(sign).to.be.calledWith(key);
		});

		it("compares the created signature with the provided one", function() {
			checkable.check(key);

			expect(compare).to.be.calledOnce;
			expect(compare).to.be.calledWith(createdSignature, signature);
		});

		it("returns the comparison result", function() {
			expect(checkable.check(key)).to.be.true;
			expect(checkable.check(otherKey)).to.be.false;
		});
	});
});
