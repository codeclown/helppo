#!/usr/bin/env node

import express from "express";
import path from "path";
import readline from "readline";
import connectionStringFromKnexfile from "./connectionStringFromKnexfile";
import * as mysqlResolver from "./mysqlResolver";
import { parseArgs } from "./parseArgs";
import * as pgResolver from "./pgResolver";

// Expected user flows, in regards to prompting and errors:
//
// If password auth fails (password was either empty or incorrect), prompt for it:
//     helppo-cli postgres://postgres:wrong@127.0.0.1:7911/postgres
//     -> Password authentication failed
//     [] Prompt: password
//
// If anything else fails, show an error line with the connection details:
//     helppo-cli postgres://wrong:secret@127.0.0.1:7911
//     helppo-cli postgres://postgres:secret@google.com:7911
//     helppo-cli postgres://postgres:secret@127.0.0.1:80
//     -> Could not connect database _database_ at _host_:_port_ as _user_

// Helppo will grab a free port from this range
const MIN_PORT = 3000;
const MAX_PORT = 3999;
const listen = (app, port, maxPort) =>
  new Promise((resolve, reject) => {
    app
      .listen(port, () => {
        resolve(port);
      })
      .on("error", (error) => {
        if (error.message.includes("EADDRINUSE") && port < maxPort - 1) {
          return listen(app, port + 1, maxPort).then((port) => resolve(port));
        }
        reject(error);
      });
  });

const colors = {
  bold: "\x1B[1m",
  dim: "\x1B[2m",
  red: "\x1B[0;31m",
  reset: "\x1B[0m",
};

function getAvailableDatabaseLibraries() {
  const available = {
    mysql: false,
    pg: false,
  };

  // Require all database libraries that are installed

  try {
    require("mysql");
    available.mysql = true;
  } catch (error) {
    // do nothing
  }

  try {
    require("pg");
    available.pg = true;
  } catch (error) {
    // do nothing
  }

  return available;
}

async function prompt(message) {
  // Custom password-style prompt
  // Go through small hoops to hide user from output
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const text = message.trim() + " ";
  rl._writeToOutput = function _writeToOutput(string) {
    rl.output.write(string.includes("\n") ? "\n" : "");
  };
  return new Promise((resolve) => {
    rl.question("", (answer) => {
      rl.close();
      resolve(answer);
    });
    process.stdout.write(text);
  });
}

async function main() {
  const argv = parseArgs(process.argv.slice(2), {
    booleans: ["help", "no-color", "dev"],
    aliases: { help: "h" },
  });

  if (argv.options["no-color"]) {
    for (let key in colors) {
      colors[key] = "";
    }
  }

  let connectionString = argv.args[0] || process.env.DATABASE_URL || "";

  if (argv.options.knexfile) {
    const knexfilePath = argv.options.knexfile.startsWith("/")
      ? argv.options.knexfile
      : path.join(process.cwd(), argv.options.knexfile);
    // eslint-disable-next-line no-console
    console.log(`Reading knexfile: ${knexfilePath}`);
    try {
      const knexConfig = require(knexfilePath);
      connectionString = await connectionStringFromKnexfile(knexConfig);
    } catch (exception) {
      throw new Error(
        `Reading knexfile failed with the following error:\n\n${exception.stack}`
      );
    }
  }

  if (argv.options.help || connectionString === "") {
    // eslint-disable-next-line no-console
    console.log(
      `
${colors.bold}helppo-cli${colors.reset} ${colors.dim}|${colors.reset} Instant database management interface in your browser

${colors.bold}USAGE${colors.reset}
  helppo-cli <connection_string>
  helppo-cli --knexfile knexfile.js

${colors.bold}ARGUMENTS${colors.reset}
  connection_string           A database connection string, see below for
                              examples.

${colors.bold}OPTIONS${colors.reset}
  -h, --help                  Show this help message
      --knexfile knexfile.js  Parse connection details from a knexfile
      --no-color              Disable colors in terminal output

${colors.bold}ENVIRONMENT VARIABLES${colors.reset}
  If DATABASE_URL is defined, it will be used.

${colors.bold}EXAMPLES${colors.reset}
  ${colors.dim}$${colors.reset} helppo-cli mysql://user:pass@localhost:3306/my_db
  ${colors.dim}$${colors.reset} helppo-cli postgres://user:pass@localhost:5432/my_db
  ${colors.dim}$${colors.reset} helppo-cli --knexfile src/knexfile.js
  ${colors.dim}$${colors.reset} DATABASE_URL=mysql://user:pass@localhost:3306/my_db helppo-cli

${colors.bold}COPYRIGHT AND LICENSE${colors.reset}
  Copyright 2020 Martti Laine - Published under the GPLv3 license
  Source: https://github.com/codeclown/helppo
  Thank you for using Helppo!
    `.trim()
    );
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: helppo, PgDriver, MysqlDriver } = require(argv.options.dev
    ? "../helppo"
    : "helppo");

  const availableDatabaseLibraries = getAvailableDatabaseLibraries();

  let driver;
  try {
    let resolver;
    let Driver;

    if (connectionString.startsWith("postgres://")) {
      if (!availableDatabaseLibraries.pg) {
        const error = new Error("The package 'pg' is not installed.");
        error.pretty = true;
        throw error;
      }
      resolver = pgResolver;
      Driver = PgDriver;
    }

    if (connectionString.startsWith("mysql://")) {
      if (!availableDatabaseLibraries.mysql) {
        const error = new Error("The package 'mysql' is not installed.");
        error.pretty = true;
        throw error;
      }
      resolver = mysqlResolver;
      Driver = MysqlDriver;
    }

    const connectionStringErrorMessage =
      "Please check your connection string. Currently supported formats:\n\n  - postgres://[user]:[password]@[host]:[port]/[database]\n  - mysql://[user]:[password]@[host]:[port]/[database]";

    if (!resolver) {
      const error = new Error(connectionStringErrorMessage);
      error.pretty = true;
      throw error;
    }

    let config;
    try {
      config = await resolver.parseConnectionString(connectionString);
    } catch (exception) {
      const error = new Error(connectionStringErrorMessage);
      error.pretty = true;
      throw error;
    }

    let safeguard = 100;
    while (safeguard--) {
      const result = await resolver.resolveConnection(config);
      if (result.prompt) {
        const value = await prompt(result.prompt.message);
        config[result.prompt.field] = value;
      } else if (result.error) {
        const error = new Error(result.error);
        error.pretty = true;
        throw error;
      } else if (result.pool) {
        driver = new Driver(result.pool);
        break;
      } else {
        throw new Error("Unknown result from driver resolver");
      }
    }
  } catch (error) {
    if (error.pretty) {
      error.message = `Connecting to database ${colors.red}failed${colors.reset}:\n  ${error.message}`;
    }
    throw error;
  }

  const app = express();
  app.use(
    helppo({
      driver,
      schema: "auto",
    })
  );
  const port = await listen(app, MIN_PORT, MAX_PORT);
  // eslint-disable-next-line no-console
  console.log(
    `Helppo is ${colors.bold}running${colors.reset}. View it in your browser:`
  );
  // eslint-disable-next-line no-console
  console.log(`  http://localhost:${port}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("");
  if (error.pretty) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  } else {
    // eslint-disable-next-line no-console
    console.error(
      `${colors.red}ERR${colors.reset} Helppo exited with an unexpected error. Stack trace:\n${error.stack}`
    );
    // eslint-disable-next-line no-console
    console.error("");
    // eslint-disable-next-line no-console
    console.error("If you think this is a bug, please file a bug report at:");
    // eslint-disable-next-line no-console
    console.error("  https://github.com/codeclown/helppo/issues");
  }
  // eslint-disable-next-line no-console
  console.error("");
  process.exit(1);
});
