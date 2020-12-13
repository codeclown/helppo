export async function parseConnectionString(
  connectionString,
  localRequire = require
) {
  const ConnectionParameters = localRequire("pg/lib/connection-parameters");
  const config = new ConnectionParameters(connectionString);
  return config;
}

export async function resolveConnection(config, localRequire = require) {
  const pg = localRequire("pg");
  const options = {
    ...config,
    max: 1,
  };
  // Include non-enumerable properties which would be ignored by the rest spread
  if (config.password) {
    options.password = config.password;
  }
  if (typeof config.ssl === "object") {
    options.ssl.key = config.ssl.key;
  }
  const pool = new pg.Pool(options);
  try {
    await pool.query("SELECT NOW()");
  } catch (error) {
    if (error.message.includes("password authentication failed")) {
      return {
        prompt: {
          field: "password",
          message: "Password authentication failed. Try again:",
        },
      };
    }
    return {
      error: `Could not connect to database "${config.database}" at ${config.host}:${config.port} as "${config.user}" (${error.message})`,
    };
  }
  return { pool };
}
