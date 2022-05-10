import {BatteriiError} from "@batterii/errors";
import {TokengripError} from "../../lib/tokengrip-error";
import {expect} from "chai";

describe("TokengripError", function() {
	it("extends BatteriiError", function() {
		expect(new TokengripError()).to.be.an.instanceOf(BatteriiError);
	});
});
