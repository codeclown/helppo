import { expect } from "chai";
import connectionStringFromKnexfile from "./connectionStringFromKnexfile";

describe("connectionStringFromKnexfile", () => {
  it("works", async () => {
    await expect(
      connectionStringFromKnexfile({
        connection: {},
      })
    ).to.be.rejectedWith(/expected a 'client' object in knexfile/);

    await expect(
      connectionStringFromKnexfile({
        client: "pg",
      })
    ).to.be.rejectedWith(/expected a 'connection' object in knexfile/);

    await expect(
      connectionStringFromKnexfile({
        client: "not_supported",
        connection: { user: "me", database: "my_app" },
      })
    ).to.be.rejectedWith(/client: 'not_supported' is currently not supported/);

    expect(
      await connectionStringFromKnexfile({
        client: "mysql",
        connection: { user: "me", database: "my_app" },
      })
    ).to.equal("mysql://me@127.0.0.1/my_app", "mysql");

    expect(
      await connectionStringFromKnexfile({
        client: "pg",
        connection: { user: "me", database: "my_app" },
      })
    ).to.equal("postgres://me@127.0.0.1/my_app", "pg");

    expect(
      await connectionStringFromKnexfile({
        client: "pg",
        connection: {
          host: "127.0.0.1",
          port: 1234,
          user: "me",
          password: "secret",
          database: "my_app",
        },
      })
    ).to.equal("postgres://me:secret@127.0.0.1:1234/my_app", "all options");

    expect(
      await connectionStringFromKnexfile(async () => ({
        client: "pg",
        connection: {
          host: "127.0.0.1",
          port: 1234,
          user: "me",
          password: "secret",
          database: "my_app",
        },
      }))
    ).to.equal("postgres://me:secret@127.0.0.1:1234/my_app", "async function");

    await expect(
      connectionStringFromKnexfile({
        client: "pg",
        connection: {
          socketPath: "/path/to/socket.sock",
          user: "me",
          password: "secret",
          database: "my_app",
        },
      })
    ).to.be.rejectedWith(/option 'socketPath' is currently not supported/);
  });
});
