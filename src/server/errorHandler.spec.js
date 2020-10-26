import { expect } from "chai";
import errorHandler from "./errorHandler";

describe("errorHandler", () => {
  it("any env: returns error message", () => {
    const env = "development";
    const logError = () => {
      // Should not arrive here
      throw new Error("Should not call logError");
    };
    expect(errorHandler(new Error("foobar"), env, logError)).to.equal("foobar");
  });

  it("production: returns generic error message and logs full", () => {
    const env = "production";
    let logErrorCalledWith;
    const logError = (...args) => {
      logErrorCalledWith = args;
    };
    expect(errorHandler(new Error("foobar"), env, logError)).to.equal(
      "An unexpected error has occurred"
    );
    expect(logErrorCalledWith).to.have.length(1);
    expect(logErrorCalledWith[0]).to.match(/^Error: foobar\n/);
  });
});
