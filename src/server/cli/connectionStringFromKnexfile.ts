interface KnexConfig {
  client?: string;
  connection?: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    socketPath?: string;
  };
}

export default async function connectionStringFromKnexfile(
  knexConfig: KnexConfig | (() => Promise<KnexConfig>)
): Promise<string> {
  if (typeof knexConfig === "function") {
    knexConfig = await knexConfig();
  }

  const { client, connection } = knexConfig;

  if (!client) {
    throw new Error(`/expected a 'client' object in knexfile`);
  }

  if (!connection) {
    throw new Error(`/expected a 'connection' object in knexfile`);
  }

  const { host, port, user, password, database, socketPath } = connection;

  if (socketPath) {
    throw new Error(`option 'socketPath' is currently not supported`);
  }

  const auth = [user, password]
    .filter((item) => typeof item === "string" && item.length > 0)
    .join(":");

  const connectionString = `${auth}@${host || "127.0.0.1"}${
    port ? `:${port}` : ""
  }/${database}`;

  if (client === "pg") {
    return `postgres://${connectionString}`;
  }

  if (client === "mysql") {
    return `mysql://${connectionString}`;
  }

  throw new Error(
    `client: '${client}' is currently not supported (supported: pg, mysql)`
  );
}
