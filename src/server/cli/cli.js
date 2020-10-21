#!/usr/bin/env node

import readline from "readline";
import express from "express";
import parseArgs from "./parseArgs";
import * as pgResolver from "./pgResolver";
import * as mysqlResolver from "./mysqlResolver";

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
          return listen(app, port + 1, maxPort);
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
  const args = parseArgs(process.argv.slice(2));

  if (!args.showColors) {
    for (let key of colors) {
      colors[key] = "";
    }
  }

  if (args.showHelp) {
    console.log(
      `
${colors.bold}helppo-cli${colors.reset} ${colors.dim}|${colors.reset} Instant database management interface in your browser

${colors.bold}USAGE${colors.reset}
  helppo-cli <connection_string>

${colors.bold}ARGUMENTS${colors.reset}
  connection_string     A database connection string, see below for examples.

${colors.bold}OPTIONS${colors.reset}
  -h, --help            Show this help message
      --no-color        Disable colors in terminal output

${colors.bold}EXAMPLES${colors.reset}
  ${colors.dim}$${colors.reset} helppo-cli mysql://user:pass@localhost:3306/my_db
  ${colors.dim}$${colors.reset} helppo-cli postgres://user:pass@localhost:5432/my_db

${colors.bold}COPYRIGHT AND LICENSE${colors.reset}
  Copyright 2020 Martti Laine - Published under the GPLv3 license
  Source: https://github.com/codeclown/helppo
  Thank you for using Helppo!
    `.trim()
    );
    return;
  }

  const helppo = require(args.dev ? "../helppo" : "helppo").default;

  const availableDatabaseLibraries = getAvailableDatabaseLibraries();

  let driver;
  try {
    let resolver;
    let Driver;

    if (args.connectionString.startsWith("postgres://")) {
      if (!availableDatabaseLibraries.pg) {
        const error = new Error("The package 'pg' is not installed.");
        error.pretty = true;
        throw error;
      }
      resolver = pgResolver;
      Driver = helppo.drivers.PgDriver;
    }

    if (args.connectionString.startsWith("mysql://")) {
      if (!availableDatabaseLibraries.mysql) {
        const error = new Error("The package 'mysql' is not installed.");
        error.pretty = true;
        throw error;
      }
      resolver = mysqlResolver;
      Driver = helppo.drivers.MysqlDriver;
    }

    if (!resolver) {
      const error = new Error(
        "Please check your connection string. Currently supported formats:\n\n  - foo\n  - bar"
      );
      error.pretty = true;
      throw error;
    }

    const config = await resolver.parseConnectionString(args.connectionString);

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
      } else if (result.connection) {
        driver = new Driver(result.connection);
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
  console.log(
    `Helppo is ${colors.bold}running${colors.reset}. View it in your browser:`
  );
  console.log(`  http://localhost:${port}`);
}

main().catch((error) => {
  console.error("");
  if (error.pretty) {
    console.error(error.message);
  } else {
    console.error(
      `${colors.red}ERR${colors.reset} Helppo exited with an unexpected error. Stack trace:\n${error.stack}`
    );
    console.error("");
    console.error("If you think this is a bug, please file a bug report at:");
    console.error("  https://github.com/codeclown/helppo/issues");
  }
  console.error("");
  process.exit(1);
});
