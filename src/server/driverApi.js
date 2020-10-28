import bodyParser from "body-parser";
import express from "express";
import findColumnRelations from "./findColumnRelations";
import findSecretColumns from "./findSecretColumns";

const emptySchema = {
  tables: [],
};

const prepareAutoSchema = (schema) => {
  schema.tables = []
    .concat(schema.tables)
    .sort((a, b) => a.name.localeCompare(b.name));
  schema = findColumnRelations(schema);
  schema = findSecretColumns(schema);
  return schema;
};

const driverApi = (config) => {
  const app = express();

  // Testing utility
  if (config.throwErrorOnPurpose) {
    app.use((req, res, next) => {
      next(
        new Error("This error was thrown for testing purposes from driverApi")
      );
    });
  }

  let schema = config.schema;
  if (schema === "auto") {
    const loadSchema = config.driver
      .getSchema()
      .then((_schema) => {
        schema = prepareAutoSchema(_schema);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`getSchema failed with error: ${error.stack}`);
      });
    app.use((req, res, next) => loadSchema.then(() => next()));
  }

  app.use(bodyParser.json());

  app.get("/column-types", (req, res) => {
    const columnTypes = Object.keys(config.columnTypes).map((type) => {
      const { builtInReactComponentName } = config.columnTypes[type];
      return {
        type,
        builtInReactComponentName,
      };
    });
    res.json(columnTypes);
  });

  app.get("/filter-types", (req, res) => {
    res.json(config.filterTypes);
  });

  app.get("/license-notice", (req, res) => {
    res.json(config.licenseNotice);
  });

  app.get("/schema", (req, res) => {
    res.json(schema && schema !== "auto" ? schema : emptySchema);
  });

  app.get("/config-notice", (req, res, next) => {
    return config.driver
      .getSchema()
      .then((liveSchema) => {
        if (typeof schema !== "object" || !Array.isArray(schema.tables)) {
          const suggestedFreshSchema = prepareAutoSchema(liveSchema);
          return res.json({
            suggestedFreshSchema,
          });
        }
        // TODO check specified columns for differences liveSchema vs schema
        res.json(null);
      })
      .catch(next);
  });

  app.get("/table/:tableName/rows", (req, res, next) => {
    let browseOptions;
    try {
      browseOptions = JSON.parse(req.query.browseOptions);
    } catch (exception) {
      browseOptions = {};
    }
    if (typeof browseOptions.perPage !== "number") {
      browseOptions.perPage = 20;
    }
    if (typeof browseOptions.currentPage !== "number") {
      browseOptions.currentPage = 1;
    }
    if (!Array.isArray(browseOptions.filters)) {
      browseOptions.filters = [];
    }
    if (typeof browseOptions.orderByColumn !== "string") {
      browseOptions.orderByColumn = null;
    }
    if (typeof browseOptions.orderByDirection !== "string") {
      browseOptions.orderByDirection = "asc";
    }
    const table = schema.tables.find(
      (table) => table.name === req.params.tableName
    );
    if (!table) {
      throw new Error(
        `Schema does not contain table named ${JSON.stringify(
          req.params.tableName
        )}`
      );
    }
    const columnNames = table.columns
      .filter((column) => !column.secret)
      .map((column) => column.name);
    const filterTypes = config.filterTypes.map((filterType) => filterType.key);
    return config.driver
      .getTableRows(table.name, columnNames, filterTypes, browseOptions)
      .then(async (result) => {
        res.json({
          rows: result.rows.map((row) => {
            return Object.keys(row).reduce((obj, columnName) => {
              const value = row[columnName];
              const column = table.columns.find(
                (column) => column.name === columnName
              );
              const columnType = config.columnTypes[column.type];
              obj[columnName] = columnType.databaseValueToJsonifiable(value);
              return obj;
            }, {});
          }),
          totalPages: result.totalPages,
          totalResults: result.totalResults,
        });
      })
      .catch(next);
  });

  app.post("/table/:tableName/rows", (req, res, next) => {
    const rowId = req.query.rowId ? JSON.parse(req.query.rowId) : undefined;
    const table = schema.tables.find(
      (table) => table.name === req.params.tableName
    );
    if (!table) {
      throw new Error(
        `Schema does not contain table named ${JSON.stringify(
          req.params.tableName
        )}`
      );
    }
    const payload = Object.keys(req.body).reduce((obj, columnName) => {
      const value = req.body[columnName];
      const column = table.columns.find((column) => column.name === columnName);
      const columnType = config.columnTypes[column.type];
      obj[columnName] = columnType.parsedJsonValueToDatabaseValue(value);
      return obj;
    }, {});
    const row = table.columns.reduce((obj, column) => {
      if (payload[column.name] === undefined) {
        return obj;
      }
      if (column.autoIncrements && payload[column.name] === null) {
        return obj;
      }
      obj[column.name] = payload[column.name];
      return obj;
    }, {});
    return config.driver
      .saveRow(table, rowId, row)
      .then((savedRow) => {
        res.json(savedRow);
      })
      .catch(next);
  });

  app.delete("/table/:tableName/rows", (req, res, next) => {
    const rowId = req.query.rowId ? JSON.parse(req.query.rowId) : undefined;
    if (rowId === undefined) {
      throw new Error("rowId missing");
    }
    const table = schema.tables.find(
      (table) => table.name === req.params.tableName
    );
    if (!table) {
      throw new Error(
        `Schema does not contain table named ${JSON.stringify(
          req.params.tableName
        )}`
      );
    }
    return config.driver
      .deleteRow(table, rowId)
      .then(() => {
        res.json({});
      })
      .catch(next);
  });

  app.post("/sql", (req, res, next) => {
    const sql = req.body.sql || "";
    if (sql === "") {
      return res.status(401).json({});
    }
    return config.driver
      .executeRawSqlQuery(sql)
      .then((result) => {
        res.json(result);
      })
      .catch(next);
  });

  app.use((req, res) => {
    res.status(404).json({
      error: {
        message: "Endpoint not found",
      },
    });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    const errorMessage = config.errorHandler(error);
    res.status(500).json({
      error: {
        message: errorMessage,
      },
    });
  });

  return app;
};

export default driverApi;
