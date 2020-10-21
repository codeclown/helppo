import { expect } from "chai";
import parseArgs from "./parseArgs";

describe("parseArgs", () => {
  it("works", () => {
    expect(parseArgs([])).to.deep.equal({
      showHelp: true,
      showColors: true,
      connectionString: "",
      dev: false,
    });
    expect(parseArgs(["-h"])).to.deep.equal({
      showHelp: true,
      showColors: true,
      connectionString: "",
      dev: false,
    });
    expect(parseArgs(["--help"])).to.deep.equal({
      showHelp: true,
      showColors: true,
      connectionString: "",
      dev: false,
    });
    expect(
      parseArgs(["--help", "mysql://user:pass@localhost:3306/my_db"])
    ).to.deep.equal({
      showHelp: true,
      showColors: true,
      connectionString: "",
      dev: false,
    });
    expect(
      parseArgs([
        "mysql://user:pass@localhost:3306/my_db",
        "postgres://user:pass@localhost:5432/my_db",
      ])
    ).to.deep.equal({
      showHelp: true,
      showColors: true,
      connectionString: "",
      dev: false,
    });
    expect(parseArgs(["mysql://user:pass@localhost:3306/my_db"])).to.deep.equal(
      {
        showHelp: false,
        showColors: true,
        connectionString: "mysql://user:pass@localhost:3306/my_db",
        dev: false,
      }
    );
    expect(
      parseArgs(["mysql://user:pass@localhost:3306/my_db", "--no-color"])
    ).to.deep.equal({
      showHelp: false,
      showColors: false,
      connectionString: "mysql://user:pass@localhost:3306/my_db",
      dev: false,
    });
    expect(
      parseArgs(["mysql://user:pass@localhost:3306/my_db", "--dev"])
    ).to.deep.equal({
      showHelp: false,
      showColors: true,
      connectionString: "mysql://user:pass@localhost:3306/my_db",
      dev: true,
    });
  });
});
