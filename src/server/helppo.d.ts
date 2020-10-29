import { Router } from "express";
import MysqlDriver from "./drivers/MysqlDriver";
import PgDriver from "./drivers/PgDriver";

export = HelppoMiddleware;

declare function HelppoMiddleware(config: {
  driver: typeof MysqlDriver | typeof PgDriver;
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
