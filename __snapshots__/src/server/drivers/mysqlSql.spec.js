exports['mysqlSql createMysqlSchemaSql no tables 1'] = []

exports['mysqlSql createMysqlSchemaSql table without columns 1'] = [
  "CREATE TABLE Foobar"
]

exports['mysqlSql createMysqlSchemaSql multiple tables 1'] = [
  "CREATE TABLE Foobar1",
  "CREATE TABLE Foobar2"
]

exports['mysqlSql createMysqlSchemaSql different column types 1'] = [
  "CREATE TABLE Foobar (Id INTEGER NOT NULL AUTO_INCREMENT , Name VARCHAR(100) NOT NULL  , Description TEXT   , CreatedAt DATETIME NOT NULL  , ActivationDate DATE NOT NULL  )"
]

exports['mysqlSql createMysqlSchemaSql primary key 1'] = [
  "CREATE TABLE Foobar (Id INTEGER NOT NULL AUTO_INCREMENT , PRIMARY KEY (Id))"
]

exports['mysqlSql createMysqlSchemaSql foreign keys 1'] = [
  "CREATE TABLE Foobar (TeamId INTEGER NOT NULL  , FOREIGN KEY (TeamId) REFERENCES Teams (Id))"
]

exports['mysqlSql createMysqlSchemaSql comments 1'] = [
  "CREATE TABLE Foobar (Id INTEGER NOT NULL  COMMENT \"foobar comment\", PRIMARY KEY (Id))"
]

exports['mysqlSql getTablesSql works 1'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.tables\n      WHERE TABLE_SCHEMA = (\n        SELECT DATABASE()\n      )\n    ",
  "params": []
}

exports['mysqlSql getIndexesSql works 1'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.statistics\n      WHERE TABLE_SCHEMA = (\n        SELECT DATABASE()\n      )\n      AND TABLE_NAME in (?)\n    ",
  "params": [
    []
  ]
}

exports['mysqlSql getIndexesSql works 2'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.statistics\n      WHERE TABLE_SCHEMA = (\n        SELECT DATABASE()\n      )\n      AND TABLE_NAME in (?)\n    ",
  "params": [
    [
      "users"
    ]
  ]
}

exports['mysqlSql getIndexesSql works 3'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.statistics\n      WHERE TABLE_SCHEMA = (\n        SELECT DATABASE()\n      )\n      AND TABLE_NAME in (?)\n    ",
  "params": [
    [
      "users",
      "tables"
    ]
  ]
}

exports['mysqlSql getForeignKeysSql works 1'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.key_column_usage\n      WHERE TABLE_SCHEMA = (\n        SELECT DATABASE()\n      )\n    ",
  "params": [
    []
  ]
}

exports['mysqlSql getForeignKeysSql works 2'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.key_column_usage\n      WHERE TABLE_SCHEMA = (\n        SELECT DATABASE()\n      )\n    ",
  "params": [
    [
      "users"
    ]
  ]
}

exports['mysqlSql getForeignKeysSql works 3'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.key_column_usage\n      WHERE TABLE_SCHEMA = (\n        SELECT DATABASE()\n      )\n    ",
  "params": [
    [
      "users",
      "tables"
    ]
  ]
}

exports['mysqlSql getColumnsSql works 1'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.columns\n      WHERE TABLE_SCHEMA = (\n        SELECT DATABASE()\n      )\n      AND TABLE_NAME in (?)\n      ORDER BY ORDINAL_POSITION\n    ",
  "params": [
    []
  ]
}

exports['mysqlSql getColumnsSql works 2'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.columns\n      WHERE TABLE_SCHEMA = (\n        SELECT DATABASE()\n      )\n      AND TABLE_NAME in (?)\n      ORDER BY ORDINAL_POSITION\n    ",
  "params": [
    [
      "users"
    ]
  ]
}

exports['mysqlSql getColumnsSql works 3'] = {
  "sql": "\n      SELECT *\n      FROM information_schema.columns\n      WHERE TABLE_SCHEMA = (\n        SELECT DATABASE()\n      )\n      AND TABLE_NAME in (?)\n      ORDER BY ORDINAL_POSITION\n    ",
  "params": [
    [
      "users",
      "tables"
    ]
  ]
}

exports['mysqlSql getSelectSql works 1'] = {
  "sql": "SELECT ?? FROM ?? LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "name"
    ],
    "users",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql calculates pagination 1'] = {
  "sql": "SELECT ?? FROM ?? LIMIT ? OFFSET ?",
  "params": [
    [
      "id"
    ],
    "users",
    15,
    105
  ]
}

exports['mysqlSql getSelectSql adds "equals" filter 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? = ? LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "name"
    ],
    "users",
    "name",
    "foobar",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds multiple filters 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ? LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "name"
    ],
    "users",
    "name",
    "foobar1",
    "name",
    "foobar2",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds order by 1'] = {
  "sql": "SELECT ?? FROM ?? ORDER BY ?? asc LIMIT ? OFFSET ?",
  "params": [
    [
      "id"
    ],
    "users",
    "id",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds order by 2'] = {
  "sql": "SELECT ?? FROM ?? ORDER BY ?? desc LIMIT ? OFFSET ?",
  "params": [
    [
      "id"
    ],
    "users",
    "id",
    1,
    0
  ]
}

exports['mysqlSql getCountSql works 1'] = {
  "sql": "SELECT count(*) as amount FROM ??",
  "params": [
    "users"
  ]
}

exports['mysqlSql getCountSql calculates pagination 1'] = {
  "sql": "SELECT count(*) as amount FROM ??",
  "params": [
    "users"
  ]
}

exports['mysqlSql getCountSql adds "equals" filter 1'] = {
  "sql": "SELECT count(*) as amount FROM ?? WHERE ?? = ?",
  "params": [
    "users",
    "name",
    "foobar"
  ]
}

exports['mysqlSql getCountSql adds multiple filters 1'] = {
  "sql": "SELECT count(*) as amount FROM ?? WHERE ?? = ? AND ?? = ?",
  "params": [
    "users",
    "name",
    "foobar1",
    "name",
    "foobar2"
  ]
}

exports['mysqlSql getUpdateRowSql works 1'] = {
  "sql": "UPDATE ?? SET ?? = ? WHERE ?? = ?",
  "params": [
    "users",
    "name",
    "foobar",
    "id",
    123
  ]
}

exports['mysqlSql getUpdateRowSql works 2'] = {
  "sql": "UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?",
  "params": [
    "users",
    "name",
    "foobar1",
    "description",
    "foobar2",
    "id",
    123
  ]
}

exports['mysqlSql getInsertRowSql works 1'] = {
  "sql": "INSERT INTO ?? (??) VALUES ?",
  "params": [
    "users",
    [
      "name"
    ],
    [
      [
        "foobar"
      ]
    ]
  ]
}

exports['mysqlSql getInsertRowSql works 2'] = {
  "sql": "INSERT INTO ?? (??) VALUES ?",
  "params": [
    "users",
    [
      "name",
      "description"
    ],
    [
      [
        "foobar1",
        "foobar2"
      ]
    ]
  ]
}

exports['mysqlSql getDeleteRowSql works 1'] = {
  "sql": "DELETE FROM ?? WHERE ?? = ?",
  "params": [
    "users",
    "id",
    123
  ]
}

exports['mysqlSql getSelectSql adds "notEquals" filter 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? != ? LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "name"
    ],
    "users",
    "name",
    "foobar",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds "contains" filter 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? LIKE ? LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "name"
    ],
    "users",
    "name",
    "%foobar%",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds "notContains" filter 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? NOT LIKE ? LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "name"
    ],
    "users",
    "name",
    "%foobar%",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds "null" filter 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? IS NULL LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "name"
    ],
    "users",
    "name",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds "notNull" filter 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? IS NOT NULL LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "name"
    ],
    "users",
    "name",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds "gt" filter 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? > ? LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "createdAt"
    ],
    "users",
    "createdAt",
    "2020-10-20 14:16:00",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds "gte" filter 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? >= ? LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "createdAt"
    ],
    "users",
    "createdAt",
    "2020-10-20 14:16:00",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds "lt" filter 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? < ? LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "createdAt"
    ],
    "users",
    "createdAt",
    "2020-10-20 14:16:00",
    1,
    0
  ]
}

exports['mysqlSql getSelectSql adds "lte" filter 1'] = {
  "sql": "SELECT ?? FROM ?? WHERE ?? <= ? LIMIT ? OFFSET ?",
  "params": [
    [
      "id",
      "createdAt"
    ],
    "users",
    "createdAt",
    "2020-10-20 14:16:00",
    1,
    0
  ]
}
