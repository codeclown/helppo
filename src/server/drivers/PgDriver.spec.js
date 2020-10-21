import { Client } from "pg";
import { driverSpec } from "./driverSpec";
import PgDriver from "./PgDriver";

describe("PgDriver", () => {
  let connection;
  const refObject = {
    driver: undefined,
  };
  before((done) => {
    connection = new Client({
      user: "postgres",
      host: "127.0.0.1",
      database: "postgres",
      password: "secret",
      port: 7811,
    });
    connection.connect((err) => {
      if (err) {
        if (err.message.includes("ECONNREFUSED")) {
          throw new Error(
            "Could not connect to Postgres server. Did you start the docker containers (refer to `docs/Development.md`)?"
          );
        }
        throw err;
      }
      refObject.driver = new PgDriver(connection);
      done();
    });
  });
  beforeEach(async () => {
    await connection.query("drop schema public cascade");
    await connection.query("create schema public");
    await connection.query("grant all on schema public to postgres");
    await connection.query("grant all on schema public to public");
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
    rawSqlQueries: {
      invalidQuery: "select * from foobar_does_not_exist",
      invalidQueryErrorMessage:
        'relation "foobar_does_not_exist" does not exist',
      selectQuery: `select "Id", "Email" from "Users"`,
      emptySelectQuery: `select "Id", "Email" from "Users" where "Id" = 90000`,
      insertQuery: `
          insert into "Teams" ("Name", "CreatedAt", "ActivationDate")
          values
            ('Test name 1', '2020-10-10 16:29:00', '2020-10-10 16:29:00'),
            ('Test name 2', '2020-10-10 16:29:00', '2020-10-10 16:29:00');
        `,
      updateQuery: `update "Teams" set "Name" = 'Foobar' where "Id" <= 2`,
    },
  });
});
