import assert from "assert";
import { parseArgs } from "./parseArgs";

describe("parseArgs", () => {
  it("parses args", () => {
    assert.deepStrictEqual(parseArgs([]), { options: {}, args: [] });
    assert.deepStrictEqual(parseArgs(["test"]), {
      options: {},
      args: ["test"],
    });
    assert.deepStrictEqual(parseArgs(["--test"]), {
      options: { test: "" },
      args: [],
    });
    assert.deepStrictEqual(parseArgs(["--test", "file"]), {
      options: { test: "file" },
      args: [],
    });
    assert.deepStrictEqual(parseArgs(["foobar", "--test", "file", "mango"]), {
      options: { test: "file" },
      args: ["foobar", "mango"],
    });
    assert.deepStrictEqual(
      parseArgs(["foobar", "--test", "file", "-o", "stdout", "mango"]),
      {
        options: { test: "file", o: "stdout" },
        args: ["foobar", "mango"],
      }
    );
  });

  it("supports options.booleans", () => {
    assert.deepStrictEqual(parseArgs(["--test"], { booleans: ["test"] }), {
      options: { test: true },
      args: [],
    });
    assert.deepStrictEqual(
      parseArgs(["--test", "file"], { booleans: ["test"] }),
      {
        options: { test: true },
        args: ["file"],
      }
    );
  });

  it("supports options.aliases", () => {
    assert.deepStrictEqual(
      parseArgs(["-t", "foobar"], { aliases: { test: "t" } }),
      {
        options: { test: "foobar" },
        args: [],
      }
    );
    assert.deepStrictEqual(
      parseArgs(["-t", "foobar"], { aliases: { test: ["t"] } }),
      {
        options: { test: "foobar" },
        args: [],
      }
    );
  });
});
