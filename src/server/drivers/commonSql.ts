import filterTypes from "../filterTypes";
import {
  QueryObject,
  BrowseFilter,
  BrowseFilterType,
  BrowseOptions,
  QueryParam,
  QueryFormatter,
  HelppoTable,
  RowObject,
} from "../types";

function addFilter(
  query: QueryObject,
  filter: BrowseFilter,
  formatter: QueryFormatter
): QueryObject {
  let value = filter.value;
  if (filter.type === "contains" || filter.type === "notContains") {
    value = `%${value}%`;
  }
  const operators: Record<BrowseFilterType, string> = {
    equals: "=",
    notEquals: "!=",
    contains: "LIKE",
    notContains: "NOT LIKE",
    null: "IS NULL",
    notNull: "IS NOT NULL",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
  };
  return formatter(query, [
    { identifier: filter.columnName },
    ` ${operators[filter.type]} `,
    ...(filter.type === "null" || filter.type === "notNull"
      ? []
      : [{ param: value }, " "]),
  ]);
}

function applyFilters(
  query: QueryObject,
  wildcardSearchableColumns: string[],
  browseOptions: BrowseOptions,
  formatter: QueryFormatter
) {
  if (browseOptions.filters.length || browseOptions.wildcardSearch !== "") {
    query = formatter(query, ["WHERE "]);
    if (browseOptions.filters.length) {
      browseOptions.filters.forEach((filter, index) => {
        if (index > 0) {
          query = formatter(query, ["AND "]);
        }
        query = addFilter(query, filter, formatter);
      });
    }
    if (browseOptions.wildcardSearch !== "") {
      if (browseOptions.filters.length) {
        query = formatter(query, ["AND ( "]);
      }
      if (wildcardSearchableColumns.length) {
        wildcardSearchableColumns.forEach((columnName, index) => {
          if (index > 0) {
            query = formatter(query, ["OR "]);
          }
          query = addFilter(
            query,
            {
              type: "contains",
              columnName,
              value: browseOptions.wildcardSearch.toLowerCase(),
            },
            formatter
          );
        });
      } else {
        query = formatter(query, [{ param: 1 }, " = ", { param: 0 }, " "]);
      }
      if (browseOptions.filters.length) {
        query = formatter(query, [") "]);
      }
    }
  }
  return query;
}

export function selectRows(
  tableName: string,
  columnNames: string[],
  wildcardSearchableColumns: string[],
  browseOptions: BrowseOptions,
  formatter: QueryFormatter
): QueryObject {
  let query = {
    sql: "",
    params: [],
  };

  query = formatter(query, [
    "SELECT ",
    { identifier: columnNames },
    " FROM ",
    { identifier: tableName },
    " ",
  ]);

  query = applyFilters(
    query,
    wildcardSearchableColumns,
    browseOptions,
    formatter
  );

  if (browseOptions.orderByColumn !== null) {
    query = formatter(query, [
      "ORDER BY ",
      { identifier: browseOptions.orderByColumn },
      ` ${browseOptions.orderByDirection.toUpperCase()} `,
    ]);
  }

  query = formatter(query, ["LIMIT ", { param: browseOptions.perPage }, " "]);

  query = formatter(query, [
    "OFFSET ",
    { param: (browseOptions.currentPage - 1) * browseOptions.perPage },
    " ",
  ]);

  return query;
}

export function countRows(
  tableName: string,
  wildcardSearchableColumns: string[],
  browseOptions: BrowseOptions,
  formatter: QueryFormatter
): QueryObject {
  let query = {
    sql: "",
    params: [],
  };

  query = formatter(query, [
    "SELECT COUNT(*) as ",
    { identifier: "amount" },
    " FROM ",
    { identifier: tableName },
    " ",
  ]);

  query = applyFilters(
    query,
    wildcardSearchableColumns,
    browseOptions,
    formatter
  );

  return query;
}

export function updateRow(
  tableName: string,
  primaryKey: string,
  primaryKeyValue: QueryParam,
  columnNames: string[],
  columnValues: QueryParam[],
  formatter: QueryFormatter
): QueryObject {
  let query = {
    sql: "",
    params: [],
  };

  query = formatter(query, ["UPDATE ", { identifier: tableName }, " SET "]);

  columnNames.forEach((columnName, index) => {
    if (index > 0) {
      query = formatter(query, ["AND "]);
    }
    query = formatter(query, [
      { identifier: columnName },
      " = ",
      { param: columnValues[index] },
      " ",
    ]);
  });

  query = formatter(query, [
    "WHERE ",
    { identifier: primaryKey },
    " = ",
    { param: primaryKeyValue },
    " ",
  ]);

  return query;
}

export function insertRow(
  tableName: string,
  columnNames: string[],
  columnValues: QueryParam[],
  primaryKey: string | null,
  formatter: QueryFormatter
): QueryObject {
  let query = {
    sql: "",
    params: [],
  };

  query = formatter(query, ["INSERT INTO ", { identifier: tableName }, " ( "]);

  columnNames.forEach((columnName, index) => {
    if (index > 0) {
      query = formatter(query, [", "]);
    }
    query = formatter(query, [{ identifier: columnName }]);
  });

  query = formatter(query, [" ) VALUES ( "]);

  columnNames.forEach((columnName, index) => {
    if (index > 0) {
      query = formatter(query, [", "]);
    }
    query = formatter(query, [{ param: columnValues[index] }]);
  });

  query = formatter(query, [" ) "]);

  if (primaryKey !== null) {
    query = formatter(query, ["RETURNING ", { identifier: primaryKey }, " "], {
      isReturningClause: true,
    });
  }

  return query;
}

export function deleteRow(
  tableName: string,
  primaryKey: string,
  primaryKeyValue: NonNullable<QueryParam>,
  formatter: QueryFormatter
): QueryObject {
  let query = {
    sql: "",
    params: [],
  };

  query = formatter(query, [
    "DELETE FROM ",
    { identifier: tableName },
    " WHERE ",
    { identifier: primaryKey },
    " = ",
    { param: primaryKeyValue },
    " ",
  ]);

  return query;
}

export type CommonSqlDriverQueryResult = {
  results: RowObject[];
  fields: { name: string }[];
  affectedRowCount?: number;
};

export abstract class CommonSqlDriver {
  queryFormatter: QueryFormatter;

  constructor(formatter: QueryFormatter) {
    this.queryFormatter = formatter;
  }

  abstract query({
    sql,
    params,
  }: QueryObject): Promise<CommonSqlDriverQueryResult>;

  async getRows(
    table: HelppoTable,
    browseOptions: BrowseOptions
  ): Promise<{
    rows: RowObject[];
    totalPages: number;
    totalResults: number;
  }> {
    const containsFilter = filterTypes.find(
      (filterType) => filterType.key === "contains"
    );
    const wildcardSearchableColumns: string[] = table.columns
      .filter((column) => {
        return (
          !column.secret &&
          containsFilter &&
          containsFilter.columnTypes.includes(column.type)
        );
      })
      .map((column) => column.name);
    const [rowsQuery, countQuery] = await Promise.all([
      this.query(
        selectRows(
          table.name,
          table.columns.map((column) => column.name),
          wildcardSearchableColumns,
          browseOptions,
          this.queryFormatter
        )
      ),
      this.query(
        countRows(
          table.name,
          wildcardSearchableColumns,
          browseOptions,
          this.queryFormatter
        )
      ),
    ]);
    const rows: RowObject[] = rowsQuery.results.map((result) => {
      const obj = {};
      rowsQuery.fields.forEach((field) => {
        obj[field.name] = result[field.name];
      });
      return obj;
    });
    const totalResults =
      typeof countQuery.results[0].amount === "string"
        ? parseInt(countQuery.results[0].amount)
        : (countQuery.results[0].amount as number);
    const totalPages =
      browseOptions.perPage === 0
        ? 0
        : Math.ceil(totalResults / browseOptions.perPage);
    return { rows, totalResults, totalPages };
  }

  abstract getAffectedRowsAmount(queryResult: unknown): number;

  abstract getLastInsertedId(queryResult: unknown, table: HelppoTable): string;

  abstract resolveInsertException(error: Error): void;

  async saveRow(
    table: HelppoTable,
    rowId: string,
    row: RowObject
  ): Promise<RowObject> {
    try {
      const columnNames = table.columns
        .map((column) => column.name)
        .filter((columnName) => Object.keys(row).includes(columnName));
      if (rowId) {
        await this.query(
          updateRow(
            table.name,
            table.primaryKey,
            rowId,
            columnNames,
            columnNames.map((columnName) => row[columnName]),
            this.queryFormatter
          )
        );
      } else {
        const insert = await this.query(
          insertRow(
            table.name,
            columnNames,
            columnNames.map((columnName) => row[columnName]),
            table.primaryKey,
            this.queryFormatter
          )
        );
        rowId = this.getLastInsertedId(insert, table);
      }
      const rowFromDb = await this.getRows(table, {
        perPage: 1,
        currentPage: 1,
        filters: [
          {
            type: "equals",
            columnName: table.primaryKey,
            value: rowId,
          },
        ],
        orderByColumn: null,
        orderByDirection: "asc",
        wildcardSearch: "",
      });
      return rowFromDb.rows[0];
    } catch (exception) {
      this.resolveInsertException(exception);
      throw exception;
    }
  }

  async deleteRow(table: HelppoTable, rowId: string): Promise<void> {
    if (table.primaryKey) {
      await this.query(
        deleteRow(table.name, table.primaryKey, rowId, this.queryFormatter)
      );
    }
  }

  async executeRawSqlQuery(
    sql: string
  ): Promise<{
    affectedRowsAmount: number;
    returnedRowsAmount: number;
    columnNames: string[];
    rows: QueryParam[][];
  }> {
    const result = await this.query({ sql, params: [] });
    const rows = Array.isArray(result.results) ? result.results : [];
    const columnNames = rows.length ? Object.keys(rows[0]) : [];
    return {
      affectedRowsAmount: this.getAffectedRowsAmount(result),
      returnedRowsAmount: rows.length,
      columnNames,
      rows: rows.map((row) => columnNames.map((columnName) => row[columnName])),
    };
  }
}
