// SQL identifiers and key words must begin with a letter (a-z, but also
// letters with diacritical marks and non-Latin letters) or an underscore
// (_). Subsequent characters in an identifier or key word can be letters,
// underscores, digits (0-9), or dollar signs ($).
// Source: https://www.postgresql.org/docs/9.2/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
export function validPostgresIdentifier(string) {
  if (!string.match(/^[A-Za-z0-9_][A-Za-z0-9_$]*$/)) {
    throw new Error(
      `String ${JSON.stringify(string)} is not a valid SQL identifier`
    );
  }
  return `"${string}"`;
}
function validPostgresIdentifiers(strings) {
  return strings.map((string) => validPostgresIdentifier(string)).join(", ");
}

export const getTablesSql = () => {
  return {
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema');
    `,
    params: [],
  };
};

export const getForeignKeysSql = (tableNames) => {
  return {
    sql: `
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
        ${tableNames.map((tableName, index) => `$${index + 1}`).join(", ")}
      );
    `,
    params: tableNames,
  };
};

export const getCommentsSql = (tableNames) => {
  return {
    sql: `
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
          ${tableNames.map((tableName, index) => `$${index + 1}`).join(", ")}
        );
    `,
    params: tableNames,
  };
};

export const getColumnsSql = (tableNames) => {
  return {
    sql: `
      SELECT *
      FROM information_schema.columns
      WHERE table_name in (
        ${tableNames.map((tableName, index) => `$${index + 1}`).join(", ")}
      )
      ORDER BY ORDINAL_POSITION
    `,
    params: tableNames,
  };
};

export const getPrimaryKeysSql = (tableNames) => {
  return {
    sql: `
      SELECT a.attname as column_name, i.indrelid::regclass as table_name
      FROM   pg_index i
      JOIN   pg_attribute a ON a.attrelid = i.indrelid
                            AND a.attnum = ANY(i.indkey)
      WHERE  i.indrelid in (
        SELECT oid FROM pg_class WHERE relname IN (
          ${tableNames.map((tableName, index) => `$${index + 1}`).join(", ")}
        )
      )
      AND    i.indisprimary;
    `,
    params: tableNames,
  };
};

export function getUpdateRowSql(
  tableName,
  primaryKey,
  rowId,
  columnNames,
  columnValues
) {
  let sql = `UPDATE ${validPostgresIdentifier(tableName)} SET `;
  const params = [];
  sql += columnNames
    .map(
      (columnName, index) =>
        `${validPostgresIdentifier(columnName)} = $${index + 1}`
    )
    .join(", ");
  columnNames.forEach((columnName, index) => params.push(columnValues[index]));
  params.push(rowId);
  sql += ` WHERE ${validPostgresIdentifier(primaryKey)} = $${params.length}`;
  return {
    sql,
    params,
  };
}

export function getInsertRowSql(
  tableName,
  primaryKey,
  columnNames,
  columnValues
) {
  const sql = `
    INSERT INTO ${validPostgresIdentifier(
      tableName
    )} (${validPostgresIdentifiers(columnNames)})
    VALUES (${columnValues.map((value, index) => `$${index + 1}`).join(", ")})
    RETURNING ${validPostgresIdentifier(primaryKey)}
  `;
  const params = [...columnValues];
  return {
    sql,
    params,
  };
}

function reduceWhereComponents(filters, paramIndex) {
  return (filters || []).reduce(
    (obj, filter) => {
      const columnName = validPostgresIdentifier(filter.columnName);
      const valueIndex = paramIndex + obj.params.length + 1;
      if (filter.type === "equals") {
        obj.params.push(filter.value);
        obj.sql.push(`${columnName} = $${valueIndex}`);
      }
      if (filter.type === "notEquals") {
        obj.params.push(filter.value);
        obj.sql.push(`${columnName} != $${valueIndex}`);
      }
      if (filter.type === "contains") {
        obj.params.push(`%${filter.value}%`);
        obj.sql.push(`${columnName} LIKE $${valueIndex}`);
      }
      if (filter.type === "notContains") {
        obj.params.push(`%${filter.value}%`);
        obj.sql.push(`${columnName} NOT LIKE $${valueIndex}`);
      }
      if (filter.type === "null") {
        obj.sql.push(`${columnName} IS NULL`);
      }
      if (filter.type === "notNull") {
        obj.sql.push(`${columnName} IS NOT NULL`);
      }
      if (filter.type === "gt") {
        obj.params.push(filter.value);
        obj.sql.push(`${columnName} > $${valueIndex}`);
      }
      if (filter.type === "gte") {
        obj.params.push(filter.value);
        obj.sql.push(`${columnName} >= $${valueIndex}`);
      }
      if (filter.type === "lt") {
        obj.params.push(filter.value);
        obj.sql.push(`${columnName} < $${valueIndex}`);
      }
      if (filter.type === "lte") {
        obj.params.push(filter.value);
        obj.sql.push(`${columnName} <= $${valueIndex}`);
      }
      return obj;
    },
    { sql: [], params: [] }
  );
}

export const getSelectSql = (tableName, columnNames, browseOptions) => {
  const {
    perPage,
    currentPage,
    filters,
    orderByColumn,
    orderByDirection,
  } = browseOptions;
  let sql = `SELECT ${validPostgresIdentifiers(
    columnNames
  )} FROM ${validPostgresIdentifier(tableName)}`;
  const params = [];
  const whereComponents = reduceWhereComponents(filters, params.length);
  if (whereComponents.sql.length) {
    sql += ` WHERE ${whereComponents.sql.join(" AND ")}`;
    params.push(...whereComponents.params);
  }
  if (orderByColumn !== null) {
    sql += ` ORDER BY ${validPostgresIdentifier(
      orderByColumn
    )} ${orderByDirection}`;
  }
  params.push(perPage);
  sql += ` LIMIT $${params.length}`;
  params.push((currentPage - 1) * perPage);
  sql += ` OFFSET $${params.length}`;
  return {
    sql,
    params,
  };
};

export const getCountSql = (tableName, columnNames, browseOptions) => {
  const { filters } = browseOptions;
  let sql = `SELECT count(*) as "amount" FROM ${validPostgresIdentifier(
    tableName
  )}`;
  const params = [];
  const whereComponents = reduceWhereComponents(filters, params.length);
  if (whereComponents.sql.length) {
    sql += ` WHERE ${whereComponents.sql.join(" AND ")}`;
    params.push(...whereComponents.params);
  }
  return {
    sql,
    params,
  };
};

export function getDeleteRowSql(tableName, primaryKey, rowId) {
  const sql = `DELETE FROM ${validPostgresIdentifier(
    tableName
  )} WHERE ${validPostgresIdentifier(primaryKey)} = $1`;
  const params = [rowId];
  return {
    sql,
    params,
  };
}
