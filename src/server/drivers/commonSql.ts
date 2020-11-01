function addFilter(
  query: QueryObject,
  filter: BrowseFilter,
  formatter: ParamFormatter
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
  columnNames: string[],
  browseOptions: BrowseOptions,
  formatter: ParamFormatter
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
      columnNames.forEach((columnName, index) => {
        if (index > 0) {
          query = formatter(query, ["OR "]);
        }
        query = addFilter(
          query,
          {
            type: "contains",
            columnName,
            value: browseOptions.wildcardSearch,
          },
          formatter
        );
      });
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
  browseOptions: BrowseOptions,
  formatter: ParamFormatter
): QueryObject {
  let query = {
    sql: "",
    params: [],
  };

  query = formatter(query, [
    "SELECT ",
    { param: columnNames },
    " FROM ",
    { identifier: tableName },
    " ",
  ]);

  query = applyFilters(query, columnNames, browseOptions, formatter);

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
  columnNames: string[],
  browseOptions: BrowseOptions,
  formatter: ParamFormatter
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

  query = applyFilters(query, columnNames, browseOptions, formatter);

  return query;
}

export function updateRow(
  tableName: string,
  primaryKey: string,
  primaryKeyValue: QueryParam,
  columnNames: string[],
  columnValues: QueryParam[],
  formatter: ParamFormatter
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
  formatter: ParamFormatter
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
    query = formatter(query, ["RETURNING ", { identifier: primaryKey }, " "]);
  }

  return query;
}

export function deleteRow(
  tableName: string,
  primaryKey: string,
  primaryKeyValue: NonNullable<QueryParam>,
  formatter: ParamFormatter
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

// SQL identifiers and key words must begin with a letter (a-z, but also
// letters with diacritical marks and non-Latin letters) or an underscore
// (_). Subsequent characters in an identifier or key word can be letters,
// underscores, digits (0-9), or dollar signs ($).
// Source: https://www.postgresql.org/docs/9.2/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
function validPostgresIdentifier(string) {
  if (!string.match(/^[A-Za-z0-9_][A-Za-z0-9_$]*$/)) {
    throw new Error(
      `String ${JSON.stringify(string)} is not a valid SQL identifier`
    );
  }
  return `"${string}"`;
}
export const pgQueryFormatter: ParamFormatter = (originalQuery, segments) => {
  return segments.reduce((query, segment) => {
    if (typeof segment === "string") {
      return {
        sql: query.sql + segment,
        params: [...query.params],
      };
    }
    if (typeof segment.param !== "undefined") {
      return {
        sql: query.sql + `$${query.params.length + 1}`,
        params: [...query.params, segment.param],
      };
    }
    if (typeof segment.identifier !== "undefined") {
      return {
        sql: query.sql + validPostgresIdentifier(segment.identifier),
        params: [...query.params],
      };
    }
  }, originalQuery);
};

export const mysqlQueryFormatter: ParamFormatter = (
  originalQuery,
  segments
) => {
  return segments.reduce((query, segment) => {
    if (typeof segment === "string") {
      return {
        sql: query.sql + segment,
        params: [...query.params],
      };
    }
    if (typeof segment.param !== "undefined") {
      return {
        sql: query.sql + "?",
        params: [...query.params, segment.param],
      };
    }
    if (typeof segment.identifier !== "undefined") {
      return {
        sql: query.sql + "??",
        params: [...query.params, segment.identifier],
      };
    }
  }, originalQuery);
};
