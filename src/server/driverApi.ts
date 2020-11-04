import * as bodyParser from "body-parser";
import express, { Router } from "express";
import findColumnRelations from "./findColumnRelations";
import findSecretColumns from "./findSecretColumns";
import readLicenseNotice from "./readLicenseNotice";
import { ColumnType, FilterType, HelppoConfig, HelppoSchema } from "./types";

const emptySchema: HelppoSchema = {
  tables: [],
};

const prepareAutoSchema = (schema: HelppoSchema): HelppoSchema => {
  schema.tables = []
    .concat(schema.tables)
    .sort((a, b) => a.name.localeCompare(b.name));
  schema = findColumnRelations(schema);
  schema = findSecretColumns(schema);
  return schema;
};

const driverApi = (
  config: HelppoConfig,
  options: {
    formatError: (error: Error) => string;
    throwErrorOnPurpose?: boolean;
    filterTypes: FilterType[];
    columnTypes: { [key: string]: ColumnType };
  }
): Router => {
  const app = express();

  // Testing utility
  if (options.throwErrorOnPurpose) {
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

  app.get("/schema", (req, res) => {
    res.json(schema && schema !== "auto" ? schema : emptySchema);
  });

  app.get("/column-types", (req, res) => {
    const columnTypes = Object.keys(options.columnTypes).map((type) => {
      const { builtInReactComponentName } = options.columnTypes[type];
      return {
        type,
        builtInReactComponentName,
      };
    });
    res.json(columnTypes);
  });

  app.get("/filter-types", (req, res) => {
    res.json(options.filterTypes);
  });

  app.get("/license-notice", (req, res) => {
    res.json(readLicenseNotice());
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
    if (schema === "auto") {
      return new Error("Schema is not specified");
    }
    const table = schema.tables.find(
      (table) => table.name === req.params.tableName
    );
    if (!table) {
      throw new Error(`Unknown table: ${JSON.stringify(req.params.tableName)}`);
    }
    let browseOptions;
    try {
      browseOptions = JSON.parse(req.query.browseOptions.toString());
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
    if (
      typeof browseOptions.orderByColumn !== "string" ||
      !table.columns.find(
        (column) => column.name === browseOptions.orderByColumn
      )
    ) {
      browseOptions.orderByColumn = null;
    }
    if (typeof browseOptions.orderByDirection !== "string") {
      browseOptions.orderByDirection = "asc";
    }
    return config.driver
      .getRows(table, browseOptions)
      .then(async (result) => {
        res.json({
          rows: result.rows.map((row) => {
            return Object.keys(row).reduce((obj, columnName) => {
              const value = row[columnName];
              const column = table.columns.find(
                (column) => column.name === columnName
              );
              const columnType = options.columnTypes[column.type];
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
    if (schema === "auto") {
      return new Error("Schema is not specified");
    }
    const rowId = req.query.rowId
      ? JSON.parse(req.query.rowId.toString())
      : undefined;
    const table = schema.tables.find(
      (table) => table.name === req.params.tableName
    );
    if (!table) {
      throw new Error(`Unknown table: ${JSON.stringify(req.params.tableName)}`);
    }
    const payload = Object.keys(req.body).reduce((obj, columnName) => {
      const value = req.body[columnName];
      const column = table.columns.find((column) => column.name === columnName);
      if (column) {
        const columnType = options.columnTypes[column.type];
        obj[columnName] = columnType.parsedJsonValueToDatabaseValue(value);
      }
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
    if (schema === "auto") {
      return new Error("Schema is not specified");
    }
    const table = schema.tables.find(
      (table) => table.name === req.params.tableName
    );
    if (!table) {
      throw new Error(`Unknown table: ${JSON.stringify(req.params.tableName)}`);
    }
    const rowId = req.query.rowId
      ? JSON.parse(req.query.rowId.toString())
      : undefined;
    if (rowId === undefined) {
      throw new Error("Missing: rowId");
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
      throw new Error("Missing: sql");
    }
    return config.driver
      .executeRawSqlQuery(sql)
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        res.json({
          errorMessage: error.message,
        });
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

  app.use(
    (
      error: Error,
      req: express.Request,
      res: express.Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next: express.NextFunction
    ) => {
      const errorMessage = options.formatError(error);
      const getStatusFromError = (error: Error): number => {
        if (error.message.startsWith("Missing: ")) {
          return 400;
        }
        if (error.message.startsWith("Unknown table: ")) {
          return 404;
        }
        return 500;
      };
      const status = getStatusFromError(error);
      res.status(status).json({
        error: {
          message: errorMessage,
        },
      });
    }
  );

  return app;
};

export default driverApi;
