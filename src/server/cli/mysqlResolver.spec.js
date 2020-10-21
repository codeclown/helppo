import { expect } from "chai";
import { parseConnectionString, resolveConnection } from "./mysqlResolver";

describe("mysqlResolver", () => {
  describe("parseConnectionString", () => {
    it("does not throw", async () => {
      await parseConnectionString("mysql://root@127.0.0.1:7812/dev_db");
    });
  });

  describe("resolveConnection", () => {
    it("uses given config and returns successful connection", async () => {
      let fakeConnection;
      const fakeConfig = {};
      const localRequire = (lib) => {
        expect(lib).to.equal("mysql", "should require mysql");
        return {
          createConnection: (config) => {
            expect(config).to.equal(fakeConfig);
            const connection = {
              connect: (callback) => callback(),
            };
            fakeConnection = connection;
            return connection;
          },
        };
      };
      const result = await resolveConnection(fakeConfig, localRequire);
      expect(result).to.have.property("connection");
      expect(result.connection).to.equal(fakeConnection);
    });

    it("returns prompt if password authentication fails", async () => {
      const localRequire = (lib) => {
        expect(lib).to.equal("mysql", "should require mysql");
        return {
          createConnection: () => {
            return {
              connect: (callback) => {
                const error = new Error(
                  'password authentication failed for user "postgres"'
                );
                error.sqlMessage =
                  "Access denied for user 'root'@'172.29.0.1' (using password: YES)";
                error.code = "ER_ACCESS_DENIED_ERROR";
                callback(error);
              },
            };
          },
        };
      };
      const result = await resolveConnection({}, localRequire);
      expect(result).to.have.property("prompt");
      expect(result.prompt).to.deep.equal({
        field: "password",
        message:
          "Access denied for user 'root'@'172.29.0.1' (using password: YES). Try password:",
      });
    });

    it("returns error if connection fails", async () => {
      const localRequire = (lib) => {
        expect(lib).to.equal("mysql", "should require mysql");
        return {
          createConnection: () => {
            return {
              connect: (callback) => {
                callback(new Error("some unknown error"));
              },
            };
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
