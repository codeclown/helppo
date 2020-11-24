export async function parseConnectionString(
  connectionString,
  localRequire = require
) {
  const ConnectionConfig = localRequire("mysql/lib/ConnectionConfig");
  const config = new ConnectionConfig(connectionString);
  return config;
}

export async function resolveConnection(config, localRequire = require) {
  const mysql = localRequire("mysql");

  const pool = mysql.createPool({ ...config, connectionLimit: 1 });

  const connect = new Promise((resolve, reject) => {
    pool.query("SELECT NOW()", (error) => {
      if (error) {
        return reject(error);
      }
      resolve(pool);
    });
  });

  try {
    await connect;
  } catch (error) {
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      return {
        prompt: {
          field: "password",
          message: `${error.sqlMessage}. Try password:`,
        },
      };
    }
    return {
      error: `Could not connect to database "${config.database}" at ${config.host}:${config.port} as "${config.user}" (${error.message})`,
    };
  }
  return { pool };
}
