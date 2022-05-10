import {expect} from "chai";
import {isToken} from "./is-token";
import jwt from "jsonwebtoken";
import {Tokengrip} from "./tokengrip";

describe("isToken", function() {
	it("returns true for a Tokengrip token", function() {
		const grip = new Tokengrip("omg seecrat");
		const token = grip.sign({foo: "bar"});

		expect(isToken(token)).to.be.true;
	});

	it("returns false for a JWT", function() {
		const token = jwt.sign({foo: "bar"}, "omg seecrat");

		expect(isToken(token)).to.be.false;
	});

	it("returns false for an arbitrary string", function() {
		expect(isToken("wowee it's a string")).to.be.false;
	});
});
