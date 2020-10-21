import { expect } from "chai";
import { parseConnectionString, resolveConnection } from "./pgResolver";

describe("pgResolver", () => {
  describe("parseConnectionString", () => {
    it("does not throw", async () => {
      await parseConnectionString(
        "postgres://postgres:example@127.0.0.1:7911/postgres"
      );
    });
  });

  describe("resolveConnection", () => {
    it("uses given config and returns successful connection", async () => {
      let fakeConnection;
      const fakeConfig = {};
      const localRequire = (lib) => {
        expect(lib).to.equal("pg", "should require pg");
        return {
          Client: class FakePgClient {
            constructor(config) {
              expect(config).to.equal(fakeConfig);
              fakeConnection = this;
            }
            connect() {
              return Promise.resolve();
            }
          },
        };
      };
      const result = await resolveConnection(fakeConfig, localRequire);
      expect(result).to.have.property("connection");
      expect(result.connection).to.equal(fakeConnection);
    });

    it("returns prompt if password authentication fails", async () => {
      const localRequire = (lib) => {
        expect(lib).to.equal("pg", "should require pg");
        return {
          Client: class FakePgClient {
            connect() {
              return Promise.reject(
                new Error('password authentication failed for user "postgres"')
              );
            }
          },
        };
      };
      const result = await resolveConnection({}, localRequire);
      expect(result).to.have.property("prompt");
      expect(result.prompt).to.deep.equal({
        field: "password",
        message: "Password authentication failed. Try again:",
      });
    });

    it("returns error if connection fails", async () => {
      const localRequire = (lib) => {
        expect(lib).to.equal("pg", "should require pg");
        return {
          Client: class FakePgClient {
            connect() {
              return Promise.reject(new Error("some unknown error"));
            }
          },
        };
      };
      const result = await resolveConnection(
        { host: "foo_host", port: 1234, user: "foo_user", database: "foo_db" },
        localRequire
      );
      expect(result).to.have.property("error");
      expect(result.error).to.equal(
        'Could not connect to database "foo_db" at foo_host:1234 as "foo_user" (some unknown error)'
      );
    });
  });
});
