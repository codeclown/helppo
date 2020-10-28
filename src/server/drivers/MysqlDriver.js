import validateBrowseOptions from "../validateBrowseOptions";
import {
  getTablesSql,
  getIndexesSql,
  getForeignKeysSql,
  getColumnsSql,
  getSelectSql,
  getCountSql,
  getUpdateRowSql,
  getInsertRowSql,
  getDeleteRowSql,
} from "./mysqlSql";

function helppoTypeToMysqlType(column) {
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
    return "DATETIME";
  }
  if (column.type === "date") {
    return "DATE";
  }
  throw new Error(
    `Could not resolve MySQL type for column ${JSON.stringify(column)}`
  );
}

function mysqlTypeToHelppoType(type) {
  if (
    type === "char" ||
    type === "enum" ||
    type === "varchar" ||
    type === "decimal" ||
    type === "bigint" ||
    type === "time"
  ) {
    return "string";
  }
  if (
    type === "tinyint" ||
    type === "smallint" ||
    type === "int" ||
    type === "mediumint" ||
    type === "year" ||
    type === "float" ||
    type === "double"
  ) {
    return "integer";
  }
  if (
    type === "tinytext" ||
    type === "text" ||
    type === "mediumtext" ||
    type === "longtext"
  ) {
    return "text";
  }
  if (type === "date") {
    return "date";
  }
  if (type === "datetime" || type === "timestamp") {
    return "datetime";
  }
  // Fallback
  return "string";
}

export function createMysqlSchemaSql(schema) {
  return schema.tables.map((table) => {
    const columns = table.columns.map((column) => {
      const notNull = column.nullable ? "" : "NOT NULL";
      const autoIncrement = column.autoIncrements ? "AUTO_INCREMENT" : "";
      const comment = column.comment
        ? `COMMENT ${JSON.stringify(column.comment)}`
        : "";
      return `${column.name} ${helppoTypeToMysqlType(
        column
      )} ${notNull} ${autoIncrement} ${comment}`;
    });
    const indexes = [
      table.primaryKey && `PRIMARY KEY (${table.primaryKey})`,
    ].filter((item) => typeof item === "string");
    const foreignKeys = table.columns
      .filter((column) => column.referencesColumn)
      .map((column) => {
        return `FOREIGN KEY (${column.name}) REFERENCES ${column.referencesTable} (${column.referencesColumn})`;
      });
    const suffix = [...columns, ...indexes, ...foreignKeys].join(", ");
    return `CREATE TABLE ${table.name}${suffix.length ? ` (${suffix})` : ""}`;
  });
}

export default class MysqlDriver {
  constructor(connection) {
    this.connection = connection;
  }

  __internalOnClose(callback) {
    this.connection.on("error", function (error) {
      if (error.code === "PROTOCOL_CONNECTION_LOST") {
        callback(error);
      }
    });
  }

  async query({ sql, params }) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params || [], (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        resolve({ results, fields });
      });
    });
  }

  async __createSchema(schema) {
    await Promise.all(
      createMysqlSchemaSql(schema).map((sql) => this.query({ sql, params: [] }))
    );
  }

  async getSchema() {
    const tableQuery = await this.query(getTablesSql());
    const tableNames = tableQuery.results.map((item) => item.TABLE_NAME);
    const columns = {};
    if (!tableNames.length) {
      return {
        tables: [],
      };
    }
    tableNames.forEach((name) => {
      columns[name] = [];
    });
    const indexQuery = await this.query(getIndexesSql(tableNames));
    const foreignKeyQuery = await this.query(getForeignKeysSql(tableNames));
    const columnQuery = await this.query(getColumnsSql(tableNames));
    columnQuery.results.forEach((column) => {
      try {
        const obj = {};
        obj.name = column.COLUMN_NAME;
        obj.type = mysqlTypeToHelppoType(column.DATA_TYPE);
        if (column.EXTRA === "auto_increment") {
          obj.autoIncrements = true;
        }
        if (column.IS_NULLABLE === "YES") {
          obj.nullable = true;
        }
        if (obj.type === "string" && column.CHARACTER_MAXIMUM_LENGTH !== null) {
          obj.maxLength = column.CHARACTER_MAXIMUM_LENGTH;
        }
        if (column.COLUMN_COMMENT) {
          obj.comment = column.COLUMN_COMMENT;
        }
        foreignKeyQuery.results
          .filter((foreignKey) => {
            return (
              foreignKey.TABLE_NAME === column.TABLE_NAME &&
              foreignKey.COLUMN_NAME === column.COLUMN_NAME &&
              // Primary keys are listed in this as well... ignore them
              foreignKey.REFERENCED_COLUMN_NAME
            );
          })
          .forEach((foreignKey) => {
            obj.referencesColumn = foreignKey.REFERENCED_COLUMN_NAME;
            obj.referencesTable = foreignKey.REFERENCED_TABLE_NAME;
          });
        columns[column.TABLE_NAME].push(obj);
      } catch (error) {
        // TODO collect and print in UI the columns that failed
        // eslint-disable-next-line no-console
        console.error(
          `Adding column ${column.COLUMN_NAME} to schema failed with error: ${error.message}`
        );
      }
    });
    const tables = tableNames.map((name) => {
      const primaryKeyIndex = indexQuery.results.find((index) => {
        return index.TABLE_NAME === name && index.INDEX_NAME === "PRIMARY";
      });
      return {
        name,
        primaryKey: primaryKeyIndex ? primaryKeyIndex.COLUMN_NAME : null,
        columns: columns[name],
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
    const totalResults = countQuery.results[0].amount;
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
          getInsertRowSql(table.name, columnNames, columnValues)
        );
        rowId = insert.results.insertId;
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
      if (
        exception.code === "ER_NO_REFERENCED_ROW" ||
        exception.code === "ER_NO_REFERENCED_ROW_2"
      ) {
        throw new Error("Foreign key constraint failed");
      }
      if (exception.code === "ER_BAD_NULL_ERROR") {
        const column = exception.sqlMessage.match(/Column '([^`]+)'/)[1];
        throw new Error(`Column ${column} is not nullable`);
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
        affectedRowsAmount: result.results.affectedRows || 0,
        returnedRowsAmount: rows.length,
        columnNames,
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
