import { expect } from "chai";
import naiveCsvStringify from "./naiveCsvStringify";

describe("naiveCsvStringify", () => {
  it("stringifies array or arrays into csv format", () => {
    expect(naiveCsvStringify([])).to.equal("");
    expect(naiveCsvStringify([["foo1", "bar1"]])).to.equal("foo1,bar1");
    expect(
      naiveCsvStringify([
        ["foo1", "bar1"],
        ["foo2", "bar2"],
      ])
    ).to.equal("foo1,bar1\nfoo2,bar2");
    expect(naiveCsvStringify([["foo1", 'quote " here', "bar1"]])).to.equal(
      'foo1,"quote \\" here",bar1'
    );
    expect(naiveCsvStringify([["foo1", "newline \n here", "bar1"]])).to.equal(
      'foo1,"newline \\n here",bar1'
    );
  });
});
