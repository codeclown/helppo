exports['pgSql buildSchemaSql no tables 1'] = []

exports['pgSql buildSchemaSql table without columns 1'] = [
  {
    "sql": "CREATE TABLE \"Foobar\"; ",
    "params": []
  }
]

exports['pgSql buildSchemaSql multiple tables 1'] = [
  {
    "sql": "CREATE TABLE \"Foobar1\"; ",
    "params": []
  },
  {
    "sql": "CREATE TABLE \"Foobar2\"; ",
    "params": []
  }
]

exports['pgSql buildSchemaSql different column types 1'] = [
  {
    "sql": "CREATE TABLE \"Foobar\" (\"Id\" SERIAL UNIQUE, \"Name\" VARCHAR(100) NOT NULL  , \"Description\" TEXT   , \"CreatedAt\" TIMESTAMP NOT NULL  , \"ActivationDate\" DATE NOT NULL  );     ",
    "params": []
  }
]

exports['pgSql buildSchemaSql primary key 1'] = [
  {
    "sql": "CREATE TABLE \"Foobar\" (\"Id\" SERIAL PRIMARY KEY); ",
    "params": []
  }
]

exports['pgSql buildSchemaSql foreign keys 1'] = [
  {
    "sql": "CREATE TABLE \"Foobar\" (\"TeamId\" INTEGER NOT NULL  , FOREIGN KEY (\"TeamId\") REFERENCES \"Teams\" (\"Id\")); ",
    "params": []
  }
]

exports['pgSql buildSchemaSql comments 1'] = [
  {
    "sql": "CREATE TABLE \"Foobar\" (\"Id\" INTEGER NOT NULL  PRIMARY KEY); COMMENT ON COLUMN \"Foobar\".\"Id\" is 'foobar comment';",
    "params": []
  }
]

exports['pgSql getSelectSql works 1'] = {
  "sql": "SELECT \"id\", \"name\" FROM \"users\" LIMIT $1 OFFSET $2",
  "params": [
    1,
    0
  ]
}

exports['pgSql getSelectSql calculates pagination 1'] = {
  "sql": "SELECT \"id\" FROM \"users\" LIMIT $1 OFFSET $2",
  "params": [
    15,
    105
  ]
}

exports['pgSql getSelectSql adds "equals" filter 1'] = {
  "sql": "SELECT \"id\", \"name\" FROM \"users\" WHERE \"name\" = $1 LIMIT $2 OFFSET $3",
  "params": [
    "foobar",
    1,
    0
  ]
}

exports['pgSql getSelectSql adds "notEquals" filter 1'] = {
  "sql": "SELECT \"id\", \"name\" FROM \"users\" WHERE \"name\" != $1 LIMIT $2 OFFSET $3",
  "params": [
    "foobar",
    1,
    0
  ]
}

exports['pgSql getSelectSql adds "contains" filter 1'] = {
  "sql": "SELECT \"id\", \"name\" FROM \"users\" WHERE \"name\" LIKE $1 LIMIT $2 OFFSET $3",
  "params": [
    "%foobar%",
    1,
    0
  ]
}

exports['pgSql getSelectSql adds "notContains" filter 1'] = {
  "sql": "SELECT \"id\", \"name\" FROM \"users\" WHERE \"name\" NOT LIKE $1 LIMIT $2 OFFSET $3",
  "params": [
    "%foobar%",
    1,
    0
  ]
}

exports['pgSql getSelectSql adds "null" filter 1'] = {
  "sql": "SELECT \"id\", \"name\" FROM \"users\" WHERE \"name\" IS NULL LIMIT $1 OFFSET $2",
  "params": [
    1,
    0
  ]
}

exports['pgSql getSelectSql adds "notNull" filter 1'] = {
  "sql": "SELECT \"id\", \"name\" FROM \"users\" WHERE \"name\" IS NOT NULL LIMIT $1 OFFSET $2",
  "params": [
    1,
    0
  ]
}

exports['pgSql getSelectSql adds "gt" filter 1'] = {
  "sql": "SELECT \"id\", \"createdAt\" FROM \"users\" WHERE \"createdAt\" > $1 LIMIT $2 OFFSET $3",
  "params": [
    "2020-10-20 14:16:00",
    1,
    0
  ]
}

exports['pgSql getSelectSql adds "gte" filter 1'] = {
  "sql": "SELECT \"id\", \"createdAt\" FROM \"users\" WHERE \"createdAt\" >= $1 LIMIT $2 OFFSET $3",
  "params": [
    "2020-10-20 14:16:00",
    1,
    0
  ]
}

exports['pgSql getSelectSql adds "lt" filter 1'] = {
  "sql": "SELECT \"id\", \"createdAt\" FROM \"users\" WHERE \"createdAt\" < $1 LIMIT $2 OFFSET $3",
  "params": [
    "2020-10-20 14:16:00",
    1,
    0
  ]
}

exports['pgSql getSelectSql adds "lte" filter 1'] = {
  "sql": "SELECT \"id\", \"createdAt\" FROM \"users\" WHERE \"createdAt\" <= $1 LIMIT $2 OFFSET $3",
  "params": [
    "2020-10-20 14:16:00",
    1,
    0
  ]
}

exports['pgSql getSelectSql adds multiple filters 1'] = {
  "sql": "SELECT \"id\", \"name\" FROM \"users\" WHERE \"name\" = $1 AND \"name\" = $2 LIMIT $3 OFFSET $4",
  "params": [
    "foobar1",
    "foobar2",
    1,
    0
  ]
}

exports['pgSql getSelectSql adds order by 1'] = {
  "sql": "SELECT \"id\" FROM \"users\" ORDER BY \"id\" asc LIMIT $1 OFFSET $2",
  "params": [
    1,
    0
  ]
}

exports['pgSql getSelectSql adds order by 2'] = {
  "sql": "SELECT \"id\" FROM \"users\" ORDER BY \"id\" desc LIMIT $1 OFFSET $2",
  "params": [
    1,
    0
  ]
}

exports['pgSql getCountSql works 1'] = {
  "sql": "SELECT count(*) as \"amount\" FROM \"users\"",
  "params": []
}

exports['pgSql getCountSql calculates pagination 1'] = {
  "sql": "SELECT count(*) as \"amount\" FROM \"users\"",
  "params": []
}

exports['pgSql getCountSql adds "equals" filter 1'] = {
  "sql": "SELECT count(*) as \"amount\" FROM \"users\" WHERE \"name\" = $1",
  "params": [
    "foobar"
  ]
}

exports['pgSql getCountSql adds multiple filters 1'] = {
  "sql": "SELECT count(*) as \"amount\" FROM \"users\" WHERE \"name\" = $1 AND \"name\" = $2",
  "params": [
    "foobar1",
    "foobar2"
  ]
}

exports['pgSql getUpdateRowSql works 1'] = {
  "sql": "UPDATE \"users\" SET \"name\" = $1 WHERE \"id\" = $2",
  "params": [
    "foobar",
    123
  ]
}

exports['pgSql getUpdateRowSql works 2'] = {
  "sql": "UPDATE \"users\" SET \"name\" = $1, \"description\" = $2 WHERE \"id\" = $3",
  "params": [
    "foobar1",
    "foobar2",
    123
  ]
}

exports['pgSql getDeleteRowSql works 1'] = {
  "sql": "DELETE FROM \"users\" WHERE \"id\" = $1",
  "params": [
    123
  ]
}

exports['pgSql getTablesSql works 1'] = {
  "sql": "\n      SELECT table_name\n      FROM information_schema.tables\n      WHERE table_type = 'BASE TABLE'\n      AND table_schema NOT IN ('pg_catalog', 'information_schema');\n    ",
  "params": []
}

exports['pgSql getForeignKeysSql works 1'] = {
  "sql": "\n      SELECT\n          tc.table_schema,\n          tc.constraint_name,\n          tc.table_name,\n          kcu.column_name,\n          ccu.table_schema AS foreign_table_schema,\n          ccu.table_name AS foreign_table_name,\n          ccu.column_name AS foreign_column_name\n      FROM\n          information_schema.table_constraints AS tc\n          JOIN information_schema.key_column_usage AS kcu\n            ON tc.constraint_name = kcu.constraint_name\n            AND tc.table_schema = kcu.table_schema\n          JOIN information_schema.constraint_column_usage AS ccu\n            ON ccu.constraint_name = tc.constraint_name\n            AND ccu.table_schema = tc.table_schema\n      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name in (\n        \n      );\n    ",
  "params": []
}

exports['pgSql getForeignKeysSql works 2'] = {
  "sql": "\n      SELECT\n          tc.table_schema,\n          tc.constraint_name,\n          tc.table_name,\n          kcu.column_name,\n          ccu.table_schema AS foreign_table_schema,\n          ccu.table_name AS foreign_table_name,\n          ccu.column_name AS foreign_column_name\n      FROM\n          information_schema.table_constraints AS tc\n          JOIN information_schema.key_column_usage AS kcu\n            ON tc.constraint_name = kcu.constraint_name\n            AND tc.table_schema = kcu.table_schema\n          JOIN information_schema.constraint_column_usage AS ccu\n            ON ccu.constraint_name = tc.constraint_name\n            AND ccu.table_schema = tc.table_schema\n      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name in (\n        $1\n      );\n    ",
  "params": [
    "users"
  ]
}

exports['pgSql getForeignKeysSql works 3'] = {
  "sql": "\n      SELECT\n          tc.table_schema,\n          tc.constraint_name,\n          tc.table_name,\n          kcu.column_name,\n          ccu.table_schema AS foreign_table_schema,\n          ccu.table_name AS foreign_table_name,\n          ccu.column_name AS foreign_column_name\n      FROM\n          information_schema.table_constraints AS tc\n          JOIN information_schema.key_column_usage AS kcu\n            ON tc.constraint_name = kcu.constraint_name\n            AND tc.table_schema = kcu.table_schema\n          JOIN information_schema.constraint_column_usage AS ccu\n            ON ccu.constraint_name = tc.constraint_name\n            AND ccu.table_schema = tc.table_schema\n      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name in (\n        $1, $2\n      );\n    ",
  "params": [
    "users",
    "tables"
  ]
}

exports['pgSql getColumnsSql works 1'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.columns\n      WHERE table_name in (\n        \n      )\n      ORDER BY ORDINAL_POSITION\n    ",
  "params": []
}

exports['pgSql getColumnsSql works 2'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.columns\n      WHERE table_name in (\n        $1\n      )\n      ORDER BY ORDINAL_POSITION\n    ",
  "params": [
    "users"
  ]
}

exports['pgSql getColumnsSql works 3'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.columns\n      WHERE table_name in (\n        $1, $2\n      )\n      ORDER BY ORDINAL_POSITION\n    ",
  "params": [
    "users",
    "tables"
  ]
}

exports['pgSql getInsertRowSql works 1'] = {
  "sql": "\n    INSERT INTO \"users\" (\"name\")\n    VALUES ($1)\n    RETURNING \"id\"\n  ",
  "params": [
    "foobar"
  ]
}

exports['pgSql getInsertRowSql works 2'] = {
  "sql": "\n    INSERT INTO \"users\" (\"name\", \"description\")\n    VALUES ($1, $2)\n    RETURNING \"id\"\n  ",
  "params": [
    "foobar1",
    "foobar2"
  ]
}

exports['pgSql getCommentsSql works 1'] = {
  "sql": "\n      SELECT\n        cols.table_name,\n        cols.column_name,\n        (\n          SELECT\n            pg_catalog.col_description(c.oid, cols.ordinal_position::int)\n          FROM\n            pg_catalog.pg_class c\n          WHERE\n            c.oid = (SELECT ('\"' || cols.table_name || '\"')::regclass::oid)\n          AND c.relname = cols.table_name\n        ) AS column_comment\n      FROM\n        information_schema.columns cols\n      WHERE\n        cols.table_name in (\n          \n        );\n    ",
  "params": []
}

exports['pgSql getCommentsSql works 2'] = {
  "sql": "\n      SELECT\n        cols.table_name,\n        cols.column_name,\n        (\n          SELECT\n            pg_catalog.col_description(c.oid, cols.ordinal_position::int)\n          FROM\n            pg_catalog.pg_class c\n          WHERE\n            c.oid = (SELECT ('\"' || cols.table_name || '\"')::regclass::oid)\n          AND c.relname = cols.table_name\n        ) AS column_comment\n      FROM\n        information_schema.columns cols\n      WHERE\n        cols.table_name in (\n          $1\n        );\n    ",
  "params": [
    "users"
  ]
}

exports['pgSql getCommentsSql works 3'] = {
  "sql": "\n      SELECT\n        cols.table_name,\n        cols.column_name,\n        (\n          SELECT\n            pg_catalog.col_description(c.oid, cols.ordinal_position::int)\n          FROM\n            pg_catalog.pg_class c\n          WHERE\n            c.oid = (SELECT ('\"' || cols.table_name || '\"')::regclass::oid)\n          AND c.relname = cols.table_name\n        ) AS column_comment\n      FROM\n        information_schema.columns cols\n      WHERE\n        cols.table_name in (\n          $1, $2\n        );\n    ",
  "params": [
    "users",
    "tables"
  ]
}

exports['pgSql getPrimaryKeysSql works 1'] = {
  "sql": "\n      SELECT a.attname as column_name, i.indrelid::regclass as table_name\n      FROM   pg_index i\n      JOIN   pg_attribute a ON a.attrelid = i.indrelid\n                            AND a.attnum = ANY(i.indkey)\n      WHERE  i.indrelid in (\n        SELECT oid FROM pg_class WHERE relname IN (\n          \n        )\n      )\n      AND    i.indisprimary;\n    ",
  "params": []
}

exports['pgSql getPrimaryKeysSql works 2'] = {
  "sql": "\n      SELECT a.attname as column_name, i.indrelid::regclass as table_name\n      FROM   pg_index i\n      JOIN   pg_attribute a ON a.attrelid = i.indrelid\n                            AND a.attnum = ANY(i.indkey)\n      WHERE  i.indrelid in (\n        SELECT oid FROM pg_class WHERE relname IN (\n          $1\n        )\n      )\n      AND    i.indisprimary;\n    ",
  "params": [
    "users"
  ]
}

exports['pgSql getPrimaryKeysSql works 3'] = {
  "sql": "\n      SELECT a.attname as column_name, i.indrelid::regclass as table_name\n      FROM   pg_index i\n      JOIN   pg_attribute a ON a.attrelid = i.indrelid\n                            AND a.attnum = ANY(i.indkey)\n      WHERE  i.indrelid in (\n        SELECT oid FROM pg_class WHERE relname IN (\n          $1, $2\n        )\n      )\n      AND    i.indisprimary;\n    ",
  "params": [
    "users",
    "tables"
  ]
}
