import validateBrowseOptions from "../validateBrowseOptions";
import {
  validPostgresIdentifier,
  getTablesSql,
  getForeignKeysSql,
  getCommentsSql,
  getColumnsSql,
  getPrimaryKeysSql,
  getSelectSql,
  getCountSql,
  getUpdateRowSql,
  getInsertRowSql,
  getDeleteRowSql,
} from "./pgSql";

export function buildSchemaSql(schema) {
  return schema.tables.map((table) => {
    const columns = table.columns.map((column) => {
      if (column.autoIncrements) {
        return `"${column.name}" SERIAL ${
          column.name === table.primaryKey ? "PRIMARY KEY" : "UNIQUE"
        }`;
      }
      const notNull = column.nullable ? "" : "NOT NULL";
      const isReferenced = schema.tables.some((table) =>
        table.columns.some(
          (item) =>
            item.referencesTable === table.name &&
            item.referencesColumn === column.name
        )
      );
      const unique = isReferenced ? "UNIQUE" : "";
      const primaryKey = column.name === table.primaryKey ? "PRIMARY KEY" : "";
      return `"${column.name}" ${PgDriver.mapHelppoTypeToPostgresType(
        column
      )} ${notNull} ${unique} ${primaryKey}`;
    });
    const foreignKeys = table.columns
      .filter((column) => column.referencesColumn)
      .map((column) => {
        return `FOREIGN KEY ("${column.name}") REFERENCES "${column.referencesTable}" ("${column.referencesColumn}")`;
      });
    const suffix = [...columns, ...foreignKeys].join(", ");
    const comments = table.columns
      .map((column) => {
        if (column.comment) {
          return `COMMENT ON COLUMN ${validPostgresIdentifier(
            table.name
          )}.${validPostgresIdentifier(
            column.name
          )} is '${column.comment.replace(/'/g, "''")}';`;
        }
        return "";
      })
      .join(" ");
    return {
      sql: `CREATE TABLE "${table.name}"${
        suffix.length ? ` (${suffix})` : ""
      }; ${comments}`,
      params: [],
    };
  });
}

export default class PgDriver {
  constructor(connection) {
    this.connection = connection;
  }

  async query({ sql, params }) {
    const result = await this.connection.query(sql, params || []);
    return {
      results: result.rows,
      fields: result.fields,
      rowCount: result.rowCount,
    };
  }

  static mapHelppoTypeToPostgresType(column) {
    if (column.type === "integer") {
      return "INTEGER";
    }
    if (column.type === "string") {
      return `VARCHAR(${column.maxLength})`;
    }
    if (column.type === "text") {
      return "TEXT";
    }
    if (column.type === "datetime") {
      return "TIMESTAMP";
    }
    if (column.type === "date") {
      return "DATE";
    }
    throw new Error(
      `Could not resolve Postgres type for column ${JSON.stringify(column)}`
    );
  }

  static mapPostgresTypeToHelppoType(type) {
    if (type === "varchar" || type === "float8") {
      return "string";
    }
    if (type === "int4" || type === "int8") {
      return "integer";
    }
    if (type === "bool") {
      return "boolean";
    }
    if (type === "text" || type === "mediumtext" || type === "json") {
      return "text";
    }
    if (type === "date") {
      return "date";
    }
    if (type === "timestamp") {
      return "datetime";
    }
    // Fallback
    return "string";
  }

  async __createSchema(schema) {
    await Promise.all(buildSchemaSql(schema).map((query) => this.query(query)));
  }

  async getSchema() {
    const tableQuery = await this.query(getTablesSql());
    const tableNames = tableQuery.results.map((item) => item.table_name);
    if (!tableNames.length) {
      return {
        tables: [],
      };
    }
    const columnsByTable = {};
    tableNames.forEach((name) => {
      columnsByTable[name] = [];
    });
    const foreignKeyQuery = await this.query(getForeignKeysSql(tableNames));
    const commentQuery = await this.query(getCommentsSql(tableNames));
    const columnQuery = await this.query(getColumnsSql(tableNames));
    columnQuery.results.forEach((column) => {
      try {
        const obj = {};
        obj.name = column.column_name;
        obj.type = PgDriver.mapPostgresTypeToHelppoType(column.udt_name);
        if (
          column.column_default !== null &&
          column.column_default.startsWith("nextval(")
        ) {
          obj.autoIncrements = true;
        }
        if (column.is_nullable === "YES") {
          obj.nullable = true;
        }
        if (column.character_maximum_length !== null) {
          obj.maxLength = column.character_maximum_length;
        }
        foreignKeyQuery.results
          .filter((foreignKey) => {
            return (
              foreignKey.table_name === column.table_name &&
              foreignKey.column_name === column.column_name
            );
          })
          .forEach((foreignKey) => {
            obj.referencesColumn = foreignKey.foreign_column_name;
            obj.referencesTable = foreignKey.foreign_table_name;
          });
        commentQuery.results
          .filter((item) => {
            return (
              item.table_name === column.table_name &&
              item.column_name === column.column_name
            );
          })
          .forEach((item) => {
            if (item.column_comment) {
              obj.comment = item.column_comment;
            }
          });
        columnsByTable[column.table_name].push(obj);
      } catch (error) {
        // TODO collect and print in UI the columns that failed
        console.error(
          `Warning: Column ${column.table_name}.${column.column_name} was skipped due to error: ${error.stack}`
        );
      }
    });
    const primaryKeyQuery = await this.query(getPrimaryKeysSql(tableNames));
    const primaryKeys = primaryKeyQuery.results.reduce((obj, row) => {
      const tableName = row.table_name.replace(/^"|"$/g, "");
      obj[tableName] = row.column_name;
      return obj;
    }, {});
    const tables = tableNames.map((name) => {
      return {
        name,
        primaryKey: primaryKeys[name] || null,
        columns: columnsByTable[name],
      };
    });
    return {
      tables,
    };
  }

  async getTableRows(tableName, columnNames, filterTypes, browseOptions) {
    validateBrowseOptions(columnNames, filterTypes, browseOptions);
    const { perPage } = browseOptions;
    const rowQuery = await this.query(
      getSelectSql(tableName, columnNames, browseOptions)
    );
    const rows = rowQuery.results.map((row) => {
      const obj = {};
      rowQuery.fields.forEach((field) => {
        obj[field.name] = row[field.name];
      });
      return obj;
    });
    const countQuery = await this.query(
      getCountSql(tableName, columnNames, browseOptions)
    );
    const totalResults = parseInt(countQuery.results[0].amount);
    const totalPages = perPage === 0 ? 0 : Math.ceil(totalResults / perPage);
    return {
      rows,
      totalPages,
      totalResults,
    };
  }

  async saveRow(table, rowId, row) {
    try {
      const schemaColumnNames = table.columns.map((column) => column.name);
      const columnNames = Object.keys(row).filter((columnName) =>
        schemaColumnNames.includes(columnName)
      );
      const columnValues = columnNames.map((columnName) => row[columnName]);
      if (rowId) {
        await this.query(
          getUpdateRowSql(
            table.name,
            table.primaryKey,
            rowId,
            columnNames,
            columnValues
          )
        );
      } else {
        const insert = await this.query(
          getInsertRowSql(
            table.name,
            table.primaryKey,
            columnNames,
            columnValues
          )
        );
        rowId = insert.results[0][table.primaryKey];
      }
      const select = await this.getTableRows(
        table.name,
        table.columns.map((column) => column.name),
        [],
        {
          perPage: 1,
          currentPage: 1,
          filters: [
            { type: "equals", columnName: table.primaryKey, value: rowId },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        }
      );
      return select.rows[0];
    } catch (exception) {
      const FOREIGN_KEY_VIOLATION = "23503";
      if (exception.code === FOREIGN_KEY_VIOLATION) {
        throw new Error("Foreign key constraint failed");
      }
      const NOT_NULL_VIOLATION = "23502";
      if (exception.code === NOT_NULL_VIOLATION) {
        throw new Error(`Column ${exception.column} is not nullable`);
      }
      throw exception;
    }
  }

  async deleteRow(table, rowId) {
    await this.query(getDeleteRowSql(table.name, table.primaryKey, rowId));
  }

  async executeRawSqlQuery(sql) {
    try {
      const result = await this.query({ sql, params: [] });
      const rows = Array.isArray(result.results) ? result.results : [];
      const columnNames = rows.length ? Object.keys(rows[0]) : [];
      return {
        affectedRowsAmount:
          !rows.length && result.rowCount ? result.rowCount : 0,
        returnedRowsAmount: rows.length,
        columnNames: rows.length ? Object.keys(rows[0]) : [],
        rows: rows.map((row) =>
          columnNames.map((columnName) => row[columnName])
        ),
      };
    } catch (error) {
      return {
        errorMessage: error.message,
      };
    }
  }
}
