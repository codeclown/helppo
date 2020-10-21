import { expect } from "chai";
import doubleQuotes from "./doubleQuotes";

describe("doubleQuotes", () => {
  it("wraps stringified value in double quotes", () => {
    expect(doubleQuotes("teams")).to.equal("“teams”");
    expect(doubleQuotes(1)).to.equal("“1”");
  });
});
