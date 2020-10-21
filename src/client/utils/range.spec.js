import { expect } from "chai";
import range from "./range";

describe("range", () => {
  it("works", () => {
    expect(range(1, 1)).to.deep.equal([1]);
    expect(range(1, 10)).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(range(5, 10)).to.deep.equal([5, 6, 7, 8, 9, 10]);
  });
});
