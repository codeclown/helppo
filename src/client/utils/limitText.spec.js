import { expect } from "chai";
import limitText from "./limitText";

describe("limitText", () => {
  it("truncates text using ellipsis", () => {
    expect(limitText("teams", 100)).to.equal("teams");
    expect(limitText("teams", 5)).to.equal("teams");
    expect(limitText("teams", 2)).to.equal("te…");
  });
});
