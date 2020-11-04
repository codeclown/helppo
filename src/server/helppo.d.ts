/* eslint-disable filenames/match-exported */

import { Router } from "express";
import { Connection } from "mysql";
import { Pool } from "pg";

// This is the public type declaration which is shipped with the npm package.
// Shouldn't import definitions from other files, because they won't be shipped
// with this one.

export default HelppoMiddleware;

declare function HelppoMiddleware(config: {
  driver: PgDriver | MysqlDriver;
  schema?:
    | "auto"
    | {
        tables: {
          name: string;
          primaryKey?: string;
          columns: ({
            name: string;
            nullable?: boolean;
            autoIncrements?: boolean;
            referencesTable?: string;
            referencesColumn?: string;
            secret?: boolean;
            comment?: string;
          } & (
            | {
                type: "integer";
              }
            | {
                type: "string";
                maxLength?: number;
              }
            | {
                type: "text";
                maxLength?: number;
              }
            | {
                type: "date";
              }
            | {
                type: "datetime";
              }
            | {
                type: "boolean";
              }
          ))[];
        }[];
      };
}): Router;

/**
 * Helppo driver for the `pg` library
 *
 * @example
 *  ```js
 *  import { Client } from 'pg';
 *  const connection = new Client(...);
 *  const driver = new PgDriver(connection);
 *  ```
 */
export class PgDriver {
  /**
   * @param connection
   */
  constructor(connection: Pool);
}

/**
 * Helppo driver for the `mysql` library
 *
 * @example
 *  ```js
 *  import { createConnection } from 'mysql';
 *  const connection = createConnection(...);
 *  const driver = new MysqlDriver(connection);
 *  ```
 */
export class MysqlDriver {
  /**
   * @param connection
   */
  constructor(connection: Connection);
}
