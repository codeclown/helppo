export const getTablesSql = () => {
  return {
    sql: `
      SELECT *
      FROM information_schema.tables
      WHERE TABLE_SCHEMA = (
        SELECT DATABASE()
      )
    `,
    params: [],
  };
};

export const getIndexesSql = (tableNames) => {
  return {
    sql: `
      SELECT *
      FROM information_schema.statistics
      WHERE TABLE_SCHEMA = (
        SELECT DATABASE()
      )
      AND TABLE_NAME in (?)
    `,
    params: [tableNames],
  };
};

export const getForeignKeysSql = (tableNames) => {
  return {
    sql: `
      SELECT *
      FROM information_schema.key_column_usage
      WHERE TABLE_SCHEMA = (
        SELECT DATABASE()
      )
    `,
    params: [tableNames],
  };
};

export const getColumnsSql = (tableNames) => {
  return {
    sql: `
      SELECT *
      FROM information_schema.columns
      WHERE TABLE_SCHEMA = (
        SELECT DATABASE()
      )
      AND TABLE_NAME in (?)
      ORDER BY ORDINAL_POSITION
    `,
    params: [tableNames],
  };
};

function reduceWhereComponents(filters) {
  return (filters || []).reduce(
    (obj, filter) => {
      if (filter.type === "equals") {
        obj.params.push(filter.columnName);
        obj.params.push(filter.value);
        obj.sql.push("?? = ?");
      }
      if (filter.type === "notEquals") {
        obj.params.push(filter.columnName);
        obj.params.push(filter.value);
        obj.sql.push("?? != ?");
      }
      if (filter.type === "contains") {
        obj.params.push(filter.columnName);
        obj.params.push(`%${filter.value}%`);
        obj.sql.push("?? LIKE ?");
      }
      if (filter.type === "notContains") {
        obj.params.push(filter.columnName);
        obj.params.push(`%${filter.value}%`);
        obj.sql.push("?? NOT LIKE ?");
      }
      if (filter.type === "null") {
        obj.params.push(filter.columnName);
        obj.sql.push("?? IS NULL");
      }
      if (filter.type === "notNull") {
        obj.params.push(filter.columnName);
        obj.sql.push("?? IS NOT NULL");
      }
      if (filter.type === "gt") {
        obj.params.push(filter.columnName);
        obj.params.push(filter.value);
        obj.sql.push("?? > ?");
      }
      if (filter.type === "gte") {
        obj.params.push(filter.columnName);
        obj.params.push(filter.value);
        obj.sql.push("?? >= ?");
      }
      if (filter.type === "lt") {
        obj.params.push(filter.columnName);
        obj.params.push(filter.value);
        obj.sql.push("?? < ?");
      }
      if (filter.type === "lte") {
        obj.params.push(filter.columnName);
        obj.params.push(filter.value);
        obj.sql.push("?? <= ?");
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
  let sql = "SELECT ?? FROM ??";
  const params = [columnNames, tableName];
  const whereComponents = reduceWhereComponents(filters);
  if (whereComponents.sql.length) {
    sql += ` WHERE ${whereComponents.sql.join(" AND ")}`;
    params.push(...whereComponents.params);
  }
  if (orderByColumn !== null) {
    sql += ` ORDER BY ?? ${orderByDirection}`;
    params.push(orderByColumn);
  }
  sql += " LIMIT ?";
  params.push(perPage);
  sql += " OFFSET ?";
  params.push((currentPage - 1) * perPage);
  return {
    sql,
    params,
  };
};

export const getCountSql = (tableName, columnNames, browseOptions) => {
  const { filters } = browseOptions;
  let sql = "SELECT count(*) as amount FROM ??";
  const params = [tableName];
  const whereComponents = reduceWhereComponents(filters);
  if (whereComponents.sql.length) {
    sql += ` WHERE ${whereComponents.sql.join(" AND ")}`;
    params.push(...whereComponents.params);
  }
  return {
    sql,
    params,
  };
};

export function getUpdateRowSql(
  tableName,
  primaryKey,
  rowId,
  columnNames,
  columnValues
) {
  let sql = "UPDATE ?? SET ";
  const params = [tableName];
  sql += columnNames.map(() => "?? = ?").join(", ");
  columnNames.forEach((columnName, index) =>
    params.push(columnName, columnValues[index])
  );
  sql += " WHERE ?? = ?";
  params.push(primaryKey, rowId);
  return {
    sql,
    params,
  };
}

export function getInsertRowSql(tableName, columnNames, columnValues) {
  const sql = "INSERT INTO ?? (??) VALUES ?";
  const params = [tableName, columnNames, [columnValues]];
  return {
    sql,
    params,
  };
}

export function getDeleteRowSql(tableName, primaryKey, rowId) {
  const sql = "DELETE FROM ?? WHERE ?? = ?";
  const params = [tableName, primaryKey, rowId];
  return {
    sql,
    params,
  };
}
