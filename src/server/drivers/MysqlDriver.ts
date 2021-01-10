import { Pool } from "mysql";
import {
  FilterType,
  HelppoColumn,
  HelppoColumnType,
  HelppoSchema,
} from "../../sharedTypes";
import filterNames from "../filterNames";
import { HelppoDriver, QueryFormatter, QueryObject } from "../types";
import { CommonSqlDriver, CommonSqlDriverQueryResult } from "./commonSql";

type MysqlColumnType =
  | "integer"
  | "int"
  | "smallint"
  | "tinyint"
  | "mediumint"
  | "bigint"
  | "decimal"
  | "numeric"
  | "float"
  | "double"
  | "bit"
  | "date"
  | "datetime"
  | "timestamp"
  | "time"
  | "year"
  | "char"
  | "varchar"
  | "binary"
  | "varbinary"
  | "blob"
  | "tinyblob"
  | "mediumblob"
  | "longblob"
  | "text"
  | "tinytext"
  | "mediumtext"
  | "longtext"
  | "enum"
  | "set"
  | "json";

const mysqlTypeToHelppoType: Record<MysqlColumnType, HelppoColumnType> = {
  integer: "integer",
  int: "integer",
  smallint: "integer",
  tinyint: "integer",
  mediumint: "integer",
  bigint: "integer",
  decimal: "string",
  numeric: "string",
  float: "string",
  double: "string",
  bit: "string",
  date: "date",
  datetime: "datetime",
  timestamp: "datetime",
  time: "string",
  year: "string",
  char: "string",
  varchar: "string",
  binary: "string",
  varbinary: "string",
  blob: "text",
  tinyblob: "text",
  mediumblob: "text",
  longblob: "text",
  text: "text",
  tinytext: "text",
  mediumtext: "text",
  longtext: "text",
  enum: "string",
  set: "string",
  json: "text",
};

export const mysqlQueryFormatter: QueryFormatter = (
  originalQuery,
  segments,
  options = {}
) => {
  return segments.reduce((query, segment) => {
    if (options.isReturningClause) {
      return query;
    }
    if (typeof segment === "string") {
      return {
        sql: query.sql + segment,
        params: [...query.params],
      };
    }
    if ("param" in segment) {
      return {
        sql: query.sql + "?",
        params: [...query.params, segment.param],
      };
    }
    if ("identifier" in segment) {
      return {
        sql: query.sql + "??",
        params: [...query.params, segment.identifier],
      };
    }
    throw new Error("Expecting a string segment or a param/identifier");
  }, originalQuery);
};

export default class MysqlDriver
  extends CommonSqlDriver
  implements HelppoDriver {
  pool: Pool;

  constructor(pool: Pool) {
    super(mysqlQueryFormatter);
    this.pool = pool;
  }

  __internalOnClose(callback: (err: Error) => void): void {
    this.pool.on("error", function onPoolClose(error) {
      if (error.code === "PROTOCOL_CONNECTION_LOST") {
        callback(error);
      }
    });
  }

  getAffectedRowsAmount(queryResult: { affectedRows?: number }): number {
    return queryResult.affectedRows || 0;
  }

  getLastInsertedId(queryResult: { insertId?: string }): string {
    return queryResult.insertId;
  }

  resolveInsertException(
    exception: Error & { code?: string; sqlMessage?: string }
  ): void {
    if (
      exception.code === "ER_NO_REFERENCED_ROW" ||
      exception.code === "ER_NO_REFERENCED_ROW_2"
    ) {
      throw new Error("Foreign key constraint failed");
    }
    if (exception.code === "ER_BAD_NULL_ERROR") {
      const column = exception.sqlMessage
        ? exception.sqlMessage.match(/Column '([^`]+)'/)[1]
        : "_unknown_";
      throw new Error(`Column ${column} is not nullable`);
    }
  }

  async query({
    sql,
    params,
  }: QueryObject): Promise<
    CommonSqlDriverQueryResult & { affectedRows?: number; insertId?: string }
  > {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, params || [], (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        const returnValue = {
          results,
          fields,
          affectedRows: results.affectedRows || undefined,
          insertId: results.insertId || undefined,
        };
        resolve(returnValue);
      });
    });
  }

  async listTableNames(): Promise<string[]> {
    const tables = await this.query({
      sql: /*sql*/ `
        SELECT table_name
        FROM information_schema.tables
        WHERE TABLE_SCHEMA = (
          SELECT DATABASE()
        )
      `,
      params: [],
    });
    return (tables.results as { table_name: string }[]).map(
      (table) => table.table_name
    );
  }

  async listIndexes(
    tableNames: string[]
  ): Promise<
    {
      INDEX_NAME: string;
      TABLE_NAME: string;
      COLUMN_NAME: string;
    }[]
  > {
    const indexes = await this.query({
      sql: /*sql*/ `
        SELECT *
        FROM information_schema.statistics
        WHERE TABLE_SCHEMA = (
          SELECT DATABASE()
        )
        AND TABLE_NAME in (?)
      `,
      params: [tableNames],
    });
    return indexes.results as {
      INDEX_NAME: string;
      TABLE_NAME: string;
      COLUMN_NAME: string;
    }[];
  }

  async listForeignKeys(
    tableNames: string[]
  ): Promise<
    {
      TABLE_NAME: string;
      COLUMN_NAME: string;
      REFERENCED_TABLE_NAME: string;
      REFERENCED_COLUMN_NAME: string;
    }[]
  > {
    const foreignKeys = await this.query({
      sql: /*sql*/ `
        SELECT *
        FROM information_schema.key_column_usage
        WHERE TABLE_SCHEMA = (
          SELECT DATABASE()
        )
        AND REFERENCED_COLUMN_NAME IS NOT NULL
      `,
      params: [tableNames],
    });
    return foreignKeys.results as {
      TABLE_NAME: string;
      COLUMN_NAME: string;
      REFERENCED_TABLE_NAME: string;
      REFERENCED_COLUMN_NAME: string;
    }[];
  }

  async listColumns(
    tableNames: string[]
  ): Promise<
    {
      TABLE_NAME: string;
      COLUMN_NAME: string;
      DATA_TYPE: MysqlColumnType;
      IS_NULLABLE: "YES" | "NO";
      EXTRA: "auto_increment" | null;
      COLUMN_COMMENT: string | null;
      CHARACTER_MAXIMUM_LENGTH: number | null;
    }[]
  > {
    const columns = await this.query({
      sql: /*sql*/ `
        SELECT *
        FROM information_schema.columns
        WHERE TABLE_SCHEMA = (
          SELECT DATABASE()
        )
        AND TABLE_NAME in (?)
        ORDER BY ORDINAL_POSITION
      `,
      params: [tableNames],
    });
    return columns.results as {
      TABLE_NAME: string;
      COLUMN_NAME: string;
      DATA_TYPE: MysqlColumnType;
      IS_NULLABLE: "YES" | "NO";
      EXTRA: "auto_increment" | null;
      COLUMN_COMMENT: string | null;
      CHARACTER_MAXIMUM_LENGTH: number | null;
    }[];
  }

  async getSchema(): Promise<HelppoSchema> {
    const tableNames = await this.listTableNames();
    if (!tableNames.length) {
      return {
        tables: [],
      };
    }
    const [indexes, foreignKeys, allColumns] = await Promise.all([
      await this.listIndexes(tableNames),
      await this.listForeignKeys(tableNames),
      await this.listColumns(tableNames),
    ]);
    const columns: { [tableName: string]: HelppoColumn[] } = Object.fromEntries(
      tableNames.map((tableName) => [tableName, []])
    );
    for (const result of allColumns) {
      const type = mysqlTypeToHelppoType[result.DATA_TYPE];
      if (!type) {
        throw new Error(
          `Unrecognized MySQL type ${JSON.stringify(result.DATA_TYPE)}`
        );
      }
      const foreignKey = foreignKeys.find((foreignKey) => {
        return (
          foreignKey.TABLE_NAME === result.TABLE_NAME &&
          foreignKey.COLUMN_NAME === result.COLUMN_NAME
        );
      });
      const column: HelppoColumn = {
        name: result.COLUMN_NAME,
        type,
        ...(result.IS_NULLABLE === "YES" ? { nullable: true } : {}),
        ...(result.EXTRA === "auto_increment" ? { autoIncrements: true } : {}),
        ...(foreignKey
          ? {
              referencesTable: foreignKey.REFERENCED_TABLE_NAME,
              referencesColumn: foreignKey.REFERENCED_COLUMN_NAME,
            }
          : {}),
        ...(result.COLUMN_COMMENT !== ""
          ? { comment: result.COLUMN_COMMENT }
          : {}),
        ...(type === "string" && result.CHARACTER_MAXIMUM_LENGTH !== null
          ? { maxLength: result.CHARACTER_MAXIMUM_LENGTH }
          : {}),
      };
      columns[result.TABLE_NAME].push(column);
    }
    const primaryKeys: { [tableName: string]: string } = {};
    for (const index of indexes) {
      if (index.INDEX_NAME === "PRIMARY") {
        primaryKeys[index.TABLE_NAME] = index.COLUMN_NAME;
      }
    }
    return {
      tables: tableNames.map((tableName) => {
        return {
          name: tableName,
          primaryKey: primaryKeys[tableName] || undefined,
          columns: columns[tableName] || [],
        };
      }),
    };
  }

  async getFilterTypes(): Promise<FilterType[]> {
    const tableNames = await this.listTableNames();
    const columns = await this.listColumns(tableNames);
    const filterTypeKeys = Object.keys(filterNames);
    const filterTypes: FilterType[] = filterTypeKeys.map((key) => {
      return {
        key,
        name: filterNames[key],
        columnNames: [],
      };
    });
    for (const column of columns) {
      const keys: string[] = [];
      keys.push("equals");
      keys.push("notEquals");
      if (column.IS_NULLABLE === "YES") {
        keys.push("null");
        keys.push("notNull");
      }
      if (
        ["varchar", "text", "tinytext", "mediumtext", "longtext"].includes(
          column.DATA_TYPE
        )
      ) {
        keys.push("contains");
        keys.push("notContains");
      }
      if (
        ["integer", "date", "datetime"].includes(
          mysqlTypeToHelppoType[column.DATA_TYPE]
        )
      ) {
        keys.push("gt");
        keys.push("gte");
        keys.push("lt");
        keys.push("lte");
      }
      for (const filterType of keys) {
        filterTypes
          .find((type) => type.key === filterType)
          .columnNames.push({
            tableName: column.TABLE_NAME,
            columnName: column.COLUMN_NAME,
          });
      }
    }
    return filterTypes;
  }
}
