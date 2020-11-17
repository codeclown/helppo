/* eslint-disable filenames/match-exported */

import { Router } from "express";
import { Pool as MysqlPool } from "mysql";
import { Pool as PgPool } from "pg";

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
 *  import { Pool } from 'pg';
 *  const pool = new Pool(...);
 *  const driver = new PgDriver(pool);
 *  ```
 */
export class PgDriver {
  /**
   * @param pool
   */
  constructor(pool: PgPool);
}

/**
 * Helppo driver for the `mysql` library
 *
 * @example
 *  ```js
 *  import { createPool } from 'mysql';
 *  const pool = createPool(...);
 *  const driver = new MysqlDriver(pool);
 *  ```
 */
export class MysqlDriver {
  /**
   * @param pool
   */
  constructor(pool: MysqlPool);
}
