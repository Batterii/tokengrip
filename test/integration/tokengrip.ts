import {Tokengrip} from "../../lib";
import {expect} from "chai";

describe("Tokengrip (Integration)", function() {
	it("supports rotating keys and algorithms", function() {
		const grip = new Tokengrip("omg seecrat");
		const obj = {foo: "bar"};

		let token = grip.sign(obj);

		let {payload, newToken} = grip.verify(token);

		expect(payload).to.deep.equal(obj);
		expect(newToken).to.be.undefined;

		grip.keys.unshift("omg another seecrat");

		({payload, newToken} = grip.verify(token));

		expect(payload).to.deep.equal(obj);
		expect(newToken).to.be.a("string");

		token = newToken as string;
		({payload, newToken} = grip.verify(token));

		expect(payload).to.deep.equal(obj);
		expect(newToken).to.be.undefined;

		grip.algorithms.unshift("sha256");

		({payload, newToken} = grip.verify(token));

		expect(payload).to.deep.equal(obj);
		expect(newToken).to.be.a("string");

		token = newToken as string;
		({payload, newToken} = grip.verify(token));

		expect(payload).to.deep.equal(obj);
		expect(newToken).to.be.undefined;

		grip.keys.shift();
		expect(() => {
			grip.verify(token);
		}).to.throw(Error).with.property("message").that.equals(
			"Invalid signature",
		);

		grip.algorithms.shift();
		expect(() => {
			grip.verify(token);
		}).to.throw(Error).with.property("message").that.equals(
			"Algorithm 'sha256' is not allowed",
		);
	});
});
