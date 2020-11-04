import { expect } from "chai";
import { createConnection, Connection } from "mysql";
import { HelppoDriver } from "../types";
import MysqlDriver, { mysqlQueryFormatter } from "./MysqlDriver";
import { driverSpec } from "./driverSpec";

describe("MysqlDriver", () => {
  describe("mysqlQueryFormatter", () => {
    it("formats params and identifiers", () => {
      expect(
        mysqlQueryFormatter({ sql: "", params: [] }, [
          "SELECT ",
          { param: ["Id", "Name"] },
          " FROM ",
          { identifier: "FooBar" },
          " ",
        ])
      ).to.deep.equal({
        sql: "SELECT ? FROM ?? ",
        params: [["Id", "Name"], "FooBar"],
      });
    });

    it("passes through wildcard params", () => {
      expect(
        mysqlQueryFormatter({ sql: "", params: [] }, [
          "WHERE ",
          { identifier: "FooBar" },
          " LIKE ",
          { param: "%Test%" },
          " ",
        ])
      ).to.deep.equal({
        sql: "WHERE ?? LIKE ? ",
        params: ["FooBar", "%Test%"],
      });
    });

    it("extends previous query", () => {
      expect(
        mysqlQueryFormatter(
          {
            sql: "SELECT ? FROM ?? ",
            params: [["Id", "Name"], "FooBar"],
          },
          ["WHERE ", { identifier: "Id" }, " = ", { param: "foobar" }, " "]
        )
      ).to.deep.equal({
        sql: "SELECT ? FROM ?? WHERE ?? = ? ",
        params: [["Id", "Name"], "FooBar", "Id", "foobar"],
      });
    });
  });

  describe("driverSpec", () => {
    let connection: Connection;
    const refObject = {
      driver: undefined,
      createTestSchema: async () => {
        if (refObject.driver as HelppoDriver) {
          await refObject.driver.executeRawSqlQuery(/*sql*/ `
            CREATE TABLE \`Teams\` (
              \`Id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`Name\` VARCHAR(100) NOT NULL,
              \`Description\` TEXT,
              \`CreatedAt\` DATETIME NOT NULL,
              \`ActivationDate\` DATE NOT NULL COMMENT "When this team was activated by sales"
            );
          `);
          await refObject.driver.executeRawSqlQuery(/*sql*/ `
            CREATE TABLE \`Users\` (
              \`Id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`TeamId\` INT NOT NULL,
              \`Email\` VARCHAR(200) NOT NULL,
              FOREIGN KEY (\`TeamId\`) REFERENCES \`Teams\` (\`Id\`)
            );
          `);
        }
      },
    };
    before((done) => {
      connection = createConnection({
        host: "127.0.0.1",
        port: 7810,
        user: "root",
        password: "secret",
        database: "test_db",
        connectTimeout: 2000,
      });
      connection.connect((err) => {
        if (err) {
          if (err.message.includes("ECONNREFUSED")) {
            throw new Error(
              "Could not connect to MySQL server. Did you start the docker containers (refer to `docs/Development.md`)?"
            );
          }
          throw err;
        }
        refObject.driver = new MysqlDriver(connection);
        done();
      });
    });
    beforeEach((done) => {
      connection.query("drop database test_db", () => {
        connection.query("create database test_db", () => {
          connection.query("use test_db", () => {
            done();
          });
        });
      });
    });
    after((done) => {
      connection.end((err) => {
        if (err) {
          throw err;
        }
        done();
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    driverSpec(refObject, {
      invalidQuery: "select * from foobar_does_not_exist",
      invalidQueryErrorMessage: /ER_NO_SUCH_TABLE: Table 'test_db.foobar_does_not_exist' doesn't exist/,
      selectQuery: "select Id, Email from Users",
      emptySelectQuery: "select Id, Email from Users where Id = 90000",
      insertQuery: `
          insert into Teams (Name, CreatedAt, ActivationDate)
          values
            ("Test name 1", "2020-10-10 16:29:00", "2020-10-10 16:29:00"),
            ("Test name 2", "2020-10-10 16:29:00", "2020-10-10 16:29:00");
        `,
      updateQuery: 'update Teams set Name = "Foobar" where Id <= 2',
    });
  });
});
