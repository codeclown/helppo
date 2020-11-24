import { expect } from "chai";
import { createPool, Pool } from "mysql";
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
    let pool: Pool;
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
      pool = createPool({
        host: "127.0.0.1",
        port: 7810,
        user: "root",
        password: "secret",
        database: "test_db",
        connectTimeout: 2000,
      });
      pool.on("error", (err) => {
        // eslint-disable-next-line no-console
        console.error("Unexpected error on idle client", err);
      });
      refObject.driver = new MysqlDriver(pool);
      done();
    });
    beforeEach(async () => {
      const query = <T>(sql: string, params?: string[]): Promise<T[]> =>
        new Promise((resolve, reject) => {
          pool.query(sql, params, (err, results) => {
            if (err) {
              return reject(err);
            }
            resolve(results as T[]);
          });
        });

      try {
        await query("set foreign_key_checks = 0");
        for (const { table_name } of await query<{
          table_name: string;
        }>(`
          select table_name
          from information_schema.tables
          where table_schema = 'test_db';
        `)) {
          await query("drop table ??", [table_name]);
        }
        await query("set foreign_key_checks = 1");
      } catch (err) {
        if (err.message.includes("ECONNREFUSED")) {
          throw new Error(
            "Could not connect to MySQL server. Did you start the docker containers (refer to `docs/Development.md`)?"
          );
        }
        throw err;
      }

      // pool.query("drop database test_db", () => {
      //   pool.query("create database test_db", () => {
      //     pool.query("use test_db", () => {
      //       done();
      //     });
      //   });
      // });
    });
    after((done) => {
      pool.end((err) => {
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
