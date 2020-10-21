import mysql from "mysql";
import { driverSpec } from "./driverSpec";
import MysqlDriver from "./MysqlDriver";

describe("MysqlDriver", () => {
  let connection;
  const refObject = {
    driver: undefined,
  };
  before((done) => {
    connection = mysql.createConnection({
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
    rawSqlQueries: {
      invalidQuery: "select * from foobar_does_not_exist",
      invalidQueryErrorMessage:
        "ER_NO_SUCH_TABLE: Table 'test_db.foobar_does_not_exist' doesn't exist",
      selectQuery: "select Id, Email from Users",
      emptySelectQuery: "select Id, Email from Users where Id = 90000",
      insertQuery: `
          insert into Teams (Name, CreatedAt, ActivationDate)
          values
            ("Test name 1", "2020-10-10 16:29:00", "2020-10-10 16:29:00"),
            ("Test name 2", "2020-10-10 16:29:00", "2020-10-10 16:29:00");
        `,
      updateQuery: 'update Teams set Name = "Foobar" where Id <= 2',
    },
  });
});
