import { expect } from "chai";
import { Pool } from "pg";
import { HelppoDriver } from "../types";
import PgDriver, { pgQueryFormatter } from "./PgDriver";
import { driverSpec } from "./driverSpec";

describe("PgDriver", () => {
  describe("pgQueryFormatter", () => {
    it("formats params and identifiers", () => {
      expect(
        pgQueryFormatter(
          {
            sql: "",
            params: [],
          },
          [
            "SELECT ",
            { param: ["Id", "Name"] },
            " FROM ",
            { identifier: "FooBar" },
            " ",
          ]
        )
      ).to.deep.equal({
        sql: 'SELECT $1, $2 FROM "FooBar" ',
        params: ["Id", "Name"],
      });
    });

    it("passes through wildcard params", () => {
      expect(
        pgQueryFormatter({ sql: "", params: [] }, [
          "WHERE ",
          { identifier: "FooBar" },
          " LIKE ",
          { param: "%Test%" },
          " ",
        ])
      ).to.deep.equal({
        sql: 'WHERE "FooBar" LIKE $1 ',
        params: ["%Test%"],
      });
    });

    it("extends previous query", () => {
      expect(
        pgQueryFormatter(
          {
            sql: 'SELECT $1, $2 FROM "FooBar" ',
            params: ["Id", "Name"],
          },
          ["WHERE ", { identifier: "Id" }, " = ", { param: "foobar" }, " "]
        )
      ).to.deep.equal({
        sql: 'SELECT $1, $2 FROM "FooBar" WHERE "Id" = $3 ',
        params: ["Id", "Name", "foobar"],
      });
    });

    it("escapes identifiers", () => {
      const format = (identifier: string): string =>
        pgQueryFormatter(
          {
            sql: "",
            params: [],
          },
          [{ identifier }]
        ).sql;
      expect(format("Id")).to.equal('"Id"');
      expect(format("RandomName")).to.equal('"RandomName"');
    });

    it("throws on invalid identifiers", () => {
      const format = (identifier: string): string =>
        pgQueryFormatter(
          {
            sql: "",
            params: [],
          },
          [{ identifier }]
        ).sql;
      expect(() => format("Fo o")).to.throw(/is not a valid SQL identifier/);
      expect(() => format("Foo'")).to.throw(/is not a valid SQL identifier/);
      expect(() => format('Foo"')).to.throw(/is not a valid SQL identifier/);
      expect(() => format("Foo--")).to.throw(/is not a valid SQL identifier/);
    });
  });

  describe("driverSpec", () => {
    let pool: Pool;
    const refObject = {
      driver: undefined,
      createTestSchema: async () => {
        if (refObject.driver as HelppoDriver) {
          await refObject.driver.executeRawSqlQuery(/*sql*/ `
            CREATE TABLE "Teams" (
              "Id" SERIAL PRIMARY KEY,
              "Name" VARCHAR(100) NOT NULL,
              "Description" TEXT,
              "CreatedAt" TIMESTAMP NOT NULL,
              "ActivationDate" DATE NOT NULL
            );
          `);
          await refObject.driver.executeRawSqlQuery(/*sql*/ `
            COMMENT ON COLUMN "Teams"."ActivationDate" is 'When this team was activated by sales'
          `);
          await refObject.driver.executeRawSqlQuery(/*sql*/ `
            CREATE TABLE "Users" (
              "Id" SERIAL PRIMARY KEY,
              "TeamId" INT NOT NULL,
              "Email" VARCHAR(200) NOT NULL,
              FOREIGN KEY ("TeamId") REFERENCES "Teams" ("Id")
            );
          `);
        }
      },
    };
    before((done) => {
      pool = new Pool({
        user: "postgres",
        host: "127.0.0.1",
        database: "postgres",
        password: "secret",
        port: 7811,
      });
      pool.on("error", (err) => {
        // eslint-disable-next-line no-console
        console.error("Unexpected error on idle client", err);
      });
      refObject.driver = new PgDriver(pool);
      done();
    });
    beforeEach(async () => {
      try {
        await pool.query("drop schema public cascade");
        await pool.query("create schema public");
        await pool.query("grant all on schema public to postgres");
        await pool.query("grant all on schema public to public");
      } catch (err) {
        if (err.message.includes("ECONNREFUSED")) {
          throw new Error(
            "Could not connect to Postgres server. Did you start the docker containers (refer to `docs/Development.md`)?"
          );
        }
      }
    });
    after((done) => {
      pool.end(() => {
        done();
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    driverSpec(refObject, {
      invalidQuery: "select * from foobar_does_not_exist",
      invalidQueryErrorMessage: /relation "foobar_does_not_exist" does not exist/,
      selectQuery: `select "Id", "Email" from "Users"`,
      emptySelectQuery: `select "Id", "Email" from "Users" where "Id" = 90000`,
      insertQuery: `
          insert into "Teams" ("Name", "CreatedAt", "ActivationDate")
          values
            ('Test name 1', '2020-10-10 16:29:00', '2020-10-10 16:29:00'),
            ('Test name 2', '2020-10-10 16:29:00', '2020-10-10 16:29:00');
        `,
      updateQuery: `update "Teams" set "Name" = 'Foobar' where "Id" <= 2`,
    });
  });
});
