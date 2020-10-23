import { expect } from "chai";
import helppo, { MysqlDriver, PgDriver } from "./helppo";

describe("helppo", () => {
  it("is a function", () => {
    expect(helppo).to.be.a("function");
  });

  it("exports drivers", () => {
    expect(MysqlDriver).not.to.equal(undefined);
    expect(PgDriver).not.to.equal(undefined);
  });
});
