import { expect } from "chai";
import helppo from "./helppo";

describe("helppo", () => {
  it("is a funtion", () => {
    expect(helppo).to.be.a("function");
  });

  it("exports drivers", () => {
    expect(helppo.drivers).to.be.an("object");
    expect(helppo.drivers.MysqlDriver).not.to.equal(undefined);
    expect(helppo.drivers.PgDriver).not.to.equal(undefined);
  });
});
