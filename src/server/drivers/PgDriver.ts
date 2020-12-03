import { Pool, PoolClient } from "pg";
import {
  HelppoColumn,
  HelppoColumnType,
  HelppoSchema,
  HelppoTable,
  RowObject,
} from "../../sharedTypes";
import { HelppoDriver, QueryFormatter, QueryObject } from "../types";
import { CommonSqlDriver, CommonSqlDriverQueryResult } from "./commonSql";

type PgColumnType =
  | "bigint"
  | "bigserial"
  | "bit"
  | "bit varying"
  | "boolean"
  | "box"
  | "bytea"
  | "character"
  | "character varying"
  | "cidr"
  | "circle"
  | "date"
  | "double precision"
  | "inet"
  | "integer"
  | "interval fields"
  | "json"
  | "jsonb"
  | "line"
  | "lseg"
  | "macaddr"
  | "money"
  | "numeric"
  | "path"
  | "pg_lsn"
  | "point"
  | "polygon"
  | "real"
  | "smallint"
  | "smallserial"
  | "serial"
  | "text"
  | "time without time zone"
  | "time with time zone"
  | "timestamp without time zone"
  | "timestamp with time zone"
  | "tsquery"
  | "tsvector"
  | "txid_snapshot"
  | "uuid"
  | "xml";

const pgTypeToHelppoType: Record<PgColumnType, HelppoColumnType> = {
  bigint: "integer",
  bigserial: "string",
  bit: "string",
  "bit varying": "string",
  boolean: "boolean",
  box: "string",
  bytea: "string",
  character: "string",
  "character varying": "string",
  cidr: "string",
  circle: "string",
  date: "date",
  "double precision": "string",
  inet: "string",
  integer: "integer",
  "interval fields": "string",
  json: "text",
  jsonb: "text",
  line: "string",
  lseg: "string",
  macaddr: "string",
  money: "string",
  numeric: "string",
  path: "string",
  pg_lsn: "string",
  point: "string",
  polygon: "string",
  real: "string",
  smallint: "integer",
  smallserial: "integer",
  serial: "integer",
  text: "text",
  "time without time zone": "string",
  "time with time zone": "string",
  "timestamp without time zone": "datetime",
  "timestamp with time zone": "datetime",
  tsquery: "string",
  tsvector: "string",
  txid_snapshot: "string",
  uuid: "string",
  xml: "text",
};

// SQL identifiers and key words must begin with a letter (a-z, but also
// letters with diacritical marks and non-Latin letters) or an underscore
// (_). Subsequent characters in an identifier or key word can be letters,
// underscores, digits (0-9), or dollar signs ($).
// Source: https://www.postgresql.org/docs/9.2/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
function validPostgresIdentifier(identifier: string): string {
  if (
    typeof identifier !== "string" ||
    !identifier.match(/^[A-Za-z0-9_][A-Za-z0-9_$]*$/)
  ) {
    throw new Error(
      `${JSON.stringify(identifier)} is not a valid SQL identifier`
    );
  }
  return `"${identifier}"`;
}
export const pgQueryFormatter: QueryFormatter = (originalQuery, segments) => {
  return segments.reduce((query, segment) => {
    if (typeof segment === "string") {
      return {
        sql: query.sql + segment,
        params: [...query.params],
      };
    }
    if ("param" in segment) {
      const params = Array.isArray(segment.param)
        ? segment.param
        : [segment.param];
      const placeholders = params.map(
        (param, index) => `$${query.params.length + 1 + index}`
      );
      return {
        sql: query.sql + placeholders.join(", "),
        params: [...query.params, ...params],
      };
    }
    if ("identifier" in segment) {
      const identifiers: string[] = Array.isArray(segment.identifier)
        ? segment.identifier
        : [segment.identifier];
      return {
        sql:
          query.sql +
          identifiers
            .map((identifier) => validPostgresIdentifier(identifier))
            .join(", "),
        params: [...query.params],
      };
    }
    throw new Error("Expecting a string segment or a param/identifier");
  }, originalQuery);
};

const defaultGetRowsTimeoutMs = 10000;

export default class PgDriver extends CommonSqlDriver implements HelppoDriver {
  pool: Pool;
  getRowsTimeoutMs: number;

  constructor(pool: Pool) {
    super(pgQueryFormatter);
    this.pool = pool;
    this.getRowsTimeoutMs = defaultGetRowsTimeoutMs;
  }

  __internalOnClose(callback: (error: Error) => void): void {
    this.pool.on(
      "error",
      (
        error: Error & {
          severity?: string;
        }
      ) => {
        if (error.severity === "FATAL") {
          callback(error);
        }
      }
    );
  }

  setGetRowsTimeout(ms: number): void {
    this.getRowsTimeoutMs = ms;
  }

  resetDefaultGetRowsTimeout(): void {
    this.getRowsTimeoutMs = defaultGetRowsTimeoutMs;
  }

  async timeoutTransaction<T>(
    callback: (
      query: ({
        sql,
        params,
      }: QueryObject) => Promise<CommonSqlDriverQueryResult>
    ) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      // Runtime sanitization just to be sure, because this needs
      // to be passed into the query string raw
      if (typeof this.getRowsTimeoutMs !== "number") {
        throw new Error();
      }
      await client.query(
        `SET LOCAL statement_timeout = ${this.getRowsTimeoutMs}`
      );
      const result: T = await callback(async (queryObject) => {
        return await this.query(queryObject, client);
      });
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      if (
        err.message.includes("canceling statement due to statement timeout")
      ) {
        throw new Error(`Query timeout (${this.getRowsTimeoutMs}ms) reached`);
      }
      throw err;
    } finally {
      client.release();
    }
  }

  getAffectedRowsAmount(queryResult: CommonSqlDriverQueryResult): number {
    return queryResult.affectedRowCount || 0;
  }

  getLastInsertedId(
    queryResult: CommonSqlDriverQueryResult,
    table: HelppoTable
  ): string {
    return queryResult.results[0][table.primaryKey].toString();
  }

  resolveInsertException(
    exception: Error & { code?: string; column?: string }
  ): void {
    const FOREIGN_KEY_VIOLATION = "23503";
    if (exception.code === FOREIGN_KEY_VIOLATION) {
      throw new Error("Foreign key constraint failed");
    }
    const NOT_NULL_VIOLATION = "23502";
    if (exception.code === NOT_NULL_VIOLATION) {
      throw new Error(`Column ${exception.column} is not nullable`);
    }
  }

  async query(
    { sql, params }: QueryObject,
    client: Pool | PoolClient = this.pool
  ): Promise<CommonSqlDriverQueryResult> {
    const result = await client.query<RowObject>(sql, params || []);
    return {
      results: result.rows,
      fields: result.fields,
      affectedRowCount:
        !result.rows.length && result.rowCount ? result.rowCount : null,
    };
  }

  async listTableNames(): Promise<string[]> {
    const tables = await this.query({
      sql: /*sql*/ `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_name
      `,
      params: [],
    });
    return (tables.results as { table_name: string }[]).map(
      (table) => table.table_name
    );
  }

  async listComments(
    tableNames: string[]
  ): Promise<
    {
      table_name: string;
      column_name: string;
      column_comment: string;
    }[]
  > {
    const comments = await this.query(
      this.queryFormatter({ sql: "", params: [] }, [
        /*sql*/ `
          SELECT
            cols.table_name,
            cols.column_name,
            (
              SELECT
                pg_catalog.col_description(c.oid, cols.ordinal_position::int)
              FROM
                pg_catalog.pg_class c
              WHERE
                c.oid = (SELECT ('"' || cols.table_name || '"')::regclass::oid)
              AND c.relname = cols.table_name
            ) AS column_comment
          FROM
            information_schema.columns cols
          WHERE
            cols.table_name in (
        `,
        { param: tableNames },
        /*sql*/ `
          );
        `,
      ])
    );
    return comments.results as {
      table_name: string;
      column_name: string;
      column_comment: string;
    }[];
  }

  async listForeignKeys(
    tableNames: string[]
  ): Promise<
    {
      table_name: string;
      column_name: string;
      foreign_table_name: string;
      foreign_column_name: string;
    }[]
  > {
    const foreignKeys = await this.query(
      this.queryFormatter({ sql: "", params: [] }, [
        /*sql*/ `
          SELECT
            tc.table_schema,
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_schema AS foreign_table_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name in (
        `,
        { param: tableNames },
        /*sql*/ `
          );
        `,
      ])
    );
    return foreignKeys.results as {
      table_name: string;
      column_name: string;
      foreign_table_name: string;
      foreign_column_name: string;
    }[];
  }

  async listPrimaryKeys(
    tableNames: string[]
  ): Promise<
    {
      table_name: string;
      column_name: string;
    }[]
  > {
    const primaryKeys = await this.query(
      this.queryFormatter({ sql: "", params: [] }, [
        /*sql*/ `
          SELECT a.attname as column_name, i.indrelid::regclass as table_name
          FROM   pg_index i
          JOIN   pg_attribute a ON a.attrelid = i.indrelid
                                AND a.attnum = ANY(i.indkey)
          WHERE  i.indrelid in (
            SELECT oid FROM pg_class WHERE relname IN (
        `,
        { param: tableNames },
        /*sql*/ `
            )
          )
          AND    i.indisprimary;
        `,
      ])
    );
    return primaryKeys.results as {
      table_name: string;
      column_name: string;
    }[];
  }

  async listColumns(
    tableNames: string[]
  ): Promise<
    {
      table_name: string;
      column_name: string;
      data_type: PgColumnType;
      is_nullable: "YES" | "NO";
      column_default: string | null;
      character_maximum_length: number | null;
    }[]
  > {
    const columns = await this.query(
      this.queryFormatter({ sql: "", params: [] }, [
        /*sql*/ `
          SELECT *
          FROM information_schema.columns
          WHERE table_name in (
        `,
        { param: tableNames },
        /*sql*/ `
            )
          ORDER BY ORDINAL_POSITION
        `,
      ])
    );
    return columns.results as {
      table_name: string;
      column_name: string;
      data_type: PgColumnType;
      is_nullable: "YES" | "NO";
      column_default: string | null;
      character_maximum_length: number | null;
    }[];
  }

  async getSchema(): Promise<HelppoSchema> {
    const tableNames = await this.listTableNames();
    if (!tableNames.length) {
      return {
        tables: [],
      };
    }
    const [comments, foreignKeys, allColumns, primaryKeys] = await Promise.all([
      await this.listComments(tableNames),
      await this.listForeignKeys(tableNames),
      await this.listColumns(tableNames),
      await this.listPrimaryKeys(tableNames),
    ]);
    const columns: { [tableName: string]: HelppoColumn[] } = Object.fromEntries(
      tableNames.map((tableName) => [tableName, []])
    );
    for (const result of allColumns) {
      const type = pgTypeToHelppoType[result.data_type];
      if (!type) {
        throw new Error(
          `Unrecognized MySQL type ${JSON.stringify(result.data_type)}`
        );
      }
      const foreignKey = foreignKeys.find((foreignKey) => {
        return (
          foreignKey.table_name === result.table_name &&
          foreignKey.column_name === result.column_name
        );
      });
      const comment = comments.find((comment) => {
        return (
          comment.table_name === result.table_name &&
          comment.column_name === result.column_name
        );
      });
      const column: HelppoColumn = {
        name: result.column_name,
        type,
        ...(result.is_nullable === "YES" ? { nullable: true } : {}),
        ...(result.column_default !== null &&
        result.column_default.startsWith("nextval(")
          ? { autoIncrements: true }
          : {}),
        ...(foreignKey
          ? {
              referencesTable: foreignKey.foreign_table_name,
              referencesColumn: foreignKey.foreign_column_name,
            }
          : {}),
        ...(comment.column_comment ? { comment: comment.column_comment } : {}),
        ...(type === "string" && result.character_maximum_length !== null
          ? { maxLength: result.character_maximum_length }
          : {}),
      };
      columns[result.table_name].push(column);
    }
    const primaryKeyMap: { [tableName: string]: string } = {};
    for (const primaryKey of primaryKeys) {
      const tableName = primaryKey.table_name.replace(/^"|"$/g, "");
      primaryKeyMap[tableName] = primaryKey.column_name;
    }
    return {
      tables: tableNames.map((tableName) => {
        return {
          name: tableName,
          primaryKey: primaryKeyMap[tableName] || undefined,
          columns: columns[tableName] || [],
        };
      }),
    };
  }
}
