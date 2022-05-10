import {InvalidStateError} from "../../lib/invalid-state-error";
import {TokengripError} from "../../lib/tokengrip-error";
import {expect} from "chai";

describe("InvalidStateError", function() {
	it("extends TokengripError", function() {
		expect(new InvalidStateError()).to.be.an.instanceOf(TokengripError);
	});
});
