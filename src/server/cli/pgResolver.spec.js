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
    it("uses given config and returns successful pool", async () => {
      let fakeConnection;
      const fakeConfig = { foo: "bar" };
      const localRequire = (lib) => {
        expect(lib).to.equal("pg", "should require pg");
        return {
          Pool: class FakePgPool {
            constructor(poolConfig) {
              expect(poolConfig).to.deep.equal({ foo: "bar", max: 1 });
              fakeConnection = this;
            }
            query() {
              return Promise.resolve();
            }
          },
        };
      };
      const result = await resolveConnection(fakeConfig, localRequire);
      expect(result).to.have.property("pool");
      expect(result.pool).to.equal(fakeConnection);
    });

    it("returns prompt if password authentication fails", async () => {
      const localRequire = (lib) => {
        expect(lib).to.equal("pg", "should require pg");
        return {
          Pool: class FakePgPool {
            query() {
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

    it("returns error if pool fails", async () => {
      const localRequire = (lib) => {
        expect(lib).to.equal("pg", "should require pg");
        return {
          Pool: class FakePgPool {
            query() {
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
