/* eslint-disable import/no-named-as-default-member */

import { expect } from "chai";
import supertest, { SuperTest, Test } from "supertest";
import columnTypes from "./columnTypes";
import driverApi from "./driverApi";
import filterTypes from "./filterTypes";
import {
  ColumnType,
  FilterType,
  HelppoConfig,
  HelppoDriver,
  HelppoSchema,
} from "./types";

class MockDriver implements HelppoDriver {
  __internalOnClose: () => {
    // do nothing
  };
  async getSchema() {
    return {
      tables: [],
    };
  }
  async getRows() {
    return {
      rows: [],
      totalPages: 1,
      totalResults: 0,
    };
  }
  async saveRow() {
    return {};
  }
  async deleteRow() {
    // do nothing
  }
  async executeRawSqlQuery() {
    return {
      affectedRowsAmount: 0,
      returnedRowsAmount: 0,
      columnNames: [],
      rows: [],
    };
  }
}

const baseConfig: HelppoConfig = {
  driver: new MockDriver(),
};

const baseOptions = {
  formatError: (error: Error) => error.message,
  filterTypes,
  columnTypes,
};

describe("driverApi", () => {
  describe("error handling", () => {
    it("returns 404 response", async () => {
      const app = driverApi(baseConfig, baseOptions);
      const request = supertest(app);
      const response = await request.get("/foobar123");
      expect(response.status).to.deep.equal(404);
      expect(response.body).to.deep.equal({
        error: {
          message: "Endpoint not found",
        },
      });
    });

    it("returns 500 response", async () => {
      let formatErrorCalledWith;
      const mockedReturnValue = "__mockedReturnValue__";
      const formatError = (...args) => {
        formatErrorCalledWith = args;
        return mockedReturnValue;
      };
      const app = driverApi(baseConfig, {
        ...baseOptions,
        throwErrorOnPurpose: true,
        formatError,
      });
      const request = supertest(app);
      const response = await request.get("/foobar123");
      expect(response.status).to.deep.equal(500);
      expect(response.body).to.deep.equal({
        error: {
          message: mockedReturnValue,
        },
      });
      expect(formatErrorCalledWith).to.have.length(1);
      expect(formatErrorCalledWith[0]).to.be.an("error");
      expect(formatErrorCalledWith[0].message).to.equal(
        "This error was thrown for testing purposes from driverApi"
      );
    });
  });

  describe("GET /schema", () => {
    it("returns empty schema", async () => {
      const app = driverApi(baseConfig, baseOptions);
      const request = supertest(app);
      const response = await request.get("/schema");
      expect(response.body).to.deep.equal({
        tables: [],
      });
    });

    it("returns schema if given in config", async () => {
      const schema = {
        tables: [{ name: "foobar", columns: [] }],
      };
      const app = driverApi({ ...baseConfig, schema }, baseOptions);
      const request = supertest(app);
      const response = await request.get("/schema");
      expect(response.body).to.deep.equal(schema);
    });

    it('loads schema via driver.getSchema if schema: "auto"', async () => {
      const schema = {
        tables: [
          {
            name: "automatic",
            columns: [],
          },
        ],
      };
      const driver = new MockDriver();
      driver.getSchema = async () => schema;
      const app = driverApi(
        {
          ...baseConfig,
          driver,
          schema: "auto",
        },
        baseOptions
      );
      const request = supertest(app);
      const response = await request.get("/schema");
      expect(response.body).to.deep.equal(schema);
    });
  });

  describe("GET /config-notice", () => {
    it("returns .suggestedFreshSchema if tables is not an array", async () => {
      const suggestedSchema = {
        tables: [
          {
            name: "automatic",
            columns: [],
          },
        ],
      };
      const driver = new MockDriver();
      driver.getSchema = async () => suggestedSchema;

      const emptySchema = undefined;
      const app1 = driverApi(
        {
          ...baseConfig,
          driver,
          schema: emptySchema,
        },
        baseOptions
      );
      const request1 = supertest(app1);
      const response1 = await request1.get("/config-notice");
      expect(response1.body).to.deep.equal({
        suggestedFreshSchema: suggestedSchema,
      });

      const invalidSchema = {
        tables: "test",
      };
      const app2 = driverApi(
        {
          ...baseConfig,
          driver,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          schema: invalidSchema,
        },
        baseOptions
      );
      const request2 = supertest(app2);
      const response2 = await request2.get("/config-notice");
      expect(response2.body).to.deep.equal({
        suggestedFreshSchema: suggestedSchema,
      });
    });

    it("returns null if a valid schema is given", async () => {
      const app = driverApi(
        {
          ...baseConfig,
          schema: {
            tables: [
              {
                name: "foobar",
                columns: [],
              },
            ],
          },
        },
        baseOptions
      );
      const request = supertest(app);
      const response = await request.get("/config-notice");
      expect(response.body).to.equal(null);
    });
  });

  describe("GET /column-types", () => {
    it("returns column types", async () => {
      const columnTypes: { [key: string]: ColumnType } = {
        exampleColumnType: {
          builtInReactComponentName: "FoobarExampleComponent",
          databaseValueToJsonifiable: () => "",
          parsedJsonValueToDatabaseValue: () => "",
        },
      };
      const app = driverApi(baseConfig, { ...baseOptions, columnTypes });
      const request = supertest(app);
      const response = await request.get("/column-types");
      expect(response.body).to.deep.equal([
        {
          type: "exampleColumnType",
          builtInReactComponentName: "FoobarExampleComponent",
        },
      ]);
    });
  });

  describe("GET /filter-types", () => {
    it("returns filter types", async () => {
      const filterTypes: FilterType[] = [
        {
          key: "equals",
          name: "equals",
          columnTypes: ["integer", "string", "text", "date", "datetime"],
        },
      ];
      const app = driverApi(baseConfig, { ...baseOptions, filterTypes });
      const request = supertest(app);
      const response = await request.get("/filter-types");
      expect(response.body).to.deep.equal(filterTypes);
    });
  });

  describe("GET /license-notice", () => {
    it("returns license notice", async () => {
      const app = driverApi(baseConfig, baseOptions);
      const request = supertest(app);
      const response = await request.get("/license-notice");
      expect(response.body).to.be.a("string");
      expect(response.body).to.contain("License: MIT");
    });
  });

  describe("GET /table/:tableName/rows", () => {
    const schema: HelppoSchema = {
      tables: [
        {
          name: "teams",
          columns: [{ name: "id", type: "integer" }],
        },
      ],
    };
    let calledGetRowsWith: unknown[];
    const mockedReturnValue = {
      rows: [],
      totalPages: 123,
      totalResults: 123,
    };
    let request: SuperTest<Test>;
    beforeEach(() => {
      const driver = new MockDriver();
      calledGetRowsWith = undefined;
      driver.getRows = async (...args) => {
        calledGetRowsWith = args;
        return mockedReturnValue;
      };
      const app = driverApi(
        {
          ...baseConfig,
          driver,
          schema,
        },
        baseOptions
      );
      request = supertest(app);
    });

    it("calls driver.getRows and returns results", async () => {
      const response = await request.get("/table/teams/rows");
      expect(calledGetRowsWith).to.deep.equal([
        schema.tables[0],
        {
          currentPage: 1,
          filters: [],
          orderByColumn: null,
          orderByDirection: "asc",
          perPage: 20,
        },
      ]);
      expect(response.body).to.deep.equal(mockedReturnValue);
    });

    it("calls driver.getRows with given browseOptions and returns results", async () => {
      const browseOptions = {
        currentPage: 42,
        filters: [{ type: "equals", columnName: "id", value: 1 }],
        orderByColumn: "id",
        orderByDirection: "desc",
        perPage: 123,
      };
      const response = await request
        .get("/table/teams/rows")
        .query({ browseOptions: JSON.stringify(browseOptions) });
      expect(calledGetRowsWith).to.deep.equal([
        schema.tables[0],
        browseOptions,
      ]);
      expect(response.body).to.deep.equal(mockedReturnValue);
    });

    it("ensures that browseOptions.orderByColumn is a column name in schema", async () => {
      const browseOptions = {
        currentPage: 42,
        filters: [{ type: "equals", columnName: "id", value: 1 }],
        orderByColumn: "secret_column",
        orderByDirection: "desc",
        perPage: 123,
      };
      const response = await request
        .get("/table/teams/rows")
        .query({ browseOptions: JSON.stringify(browseOptions) });
      expect(calledGetRowsWith).to.deep.equal([
        schema.tables[0],
        {
          ...browseOptions,
          orderByColumn: null,
        },
      ]);
      expect(response.body).to.deep.equal(mockedReturnValue);
    });

    it("returns 404 if table is not in schema", async () => {
      const response = await request.get("/table/what_is_this/rows");
      expect(calledGetRowsWith).to.equal(undefined);
      expect(response.status).to.equal(404);
      expect(response.body).to.deep.equal({
        error: {
          message: 'Unknown table: "what_is_this"',
        },
      });
    });
  });

  describe("POST /table/:tableName/rows", () => {
    const schema: HelppoSchema = {
      tables: [
        {
          name: "teams",
          columns: [
            { name: "id", type: "integer" },
            { name: "name", type: "string" },
          ],
        },
      ],
    };
    let calledSaveRowWith: unknown[];
    const mockedReturnValue = {
      id: 12345,
    };
    let request: SuperTest<Test>;
    beforeEach(() => {
      const driver = new MockDriver();
      calledSaveRowWith = undefined;
      driver.saveRow = async (...args) => {
        calledSaveRowWith = args;
        return mockedReturnValue;
      };
      const app = driverApi(
        {
          ...baseConfig,
          driver,
          schema,
        },
        baseOptions
      );
      request = supertest(app);
    });

    it("calls driver.saveRow and returns result", async () => {
      const response = await request
        .post("/table/teams/rows")
        .send({ id: 42, name: "Example" });
      expect(calledSaveRowWith).to.deep.equal([
        schema.tables[0],
        undefined,
        {
          id: 42,
          name: "Example",
        },
      ]);
      expect(response.body).to.deep.equal(mockedReturnValue);
    });

    it("allows passing partial row", async () => {
      const response = await request.post("/table/teams/rows").send({ id: 42 });
      expect(calledSaveRowWith).to.deep.equal([
        schema.tables[0],
        undefined,
        {
          id: 42,
        },
      ]);
      expect(response.body).to.deep.equal(mockedReturnValue);
    });

    it("passes on only values for columns mentioned in schema", async () => {
      const response = await request
        .post("/table/teams/rows")
        .send({ id: 42, name: "Example", strange: "foobar" });
      expect(calledSaveRowWith).to.deep.equal([
        schema.tables[0],
        undefined,
        {
          id: 42,
          name: "Example",
          // strange-property is not found here
        },
      ]);
      expect(response.body).to.deep.equal(mockedReturnValue);
    });

    it("passes rowId if given in query", async () => {
      const rowId = "fooId123";
      const response = await request
        .post("/table/teams/rows")
        .query({ rowId: JSON.stringify(rowId) })
        .send({ id: 42, name: "Example" });
      expect(calledSaveRowWith).to.deep.equal([
        schema.tables[0],
        rowId,
        {
          id: 42,
          name: "Example",
        },
      ]);
      expect(response.body).to.deep.equal(mockedReturnValue);
    });

    it("passes values through columnType.parsedJsonValueToDatabaseValue", async () => {
      const original = columnTypes.integer.parsedJsonValueToDatabaseValue;
      try {
        let calledWith: unknown;
        columnTypes.integer.parsedJsonValueToDatabaseValue = (...args) => {
          calledWith = args;
          return "__mocked__";
        };
        const response = await request
          .post("/table/teams/rows")
          .send({ id: 42 });
        expect(calledWith).to.deep.equal([42]);
        expect(calledSaveRowWith).to.deep.equal([
          schema.tables[0],
          undefined,
          {
            id: "__mocked__",
          },
        ]);
        expect(response.body).to.deep.equal(mockedReturnValue);
      } catch (exception) {
        columnTypes.integer.parsedJsonValueToDatabaseValue = original;
        throw exception;
      }
    });

    it("returns 404 if table is not in schema", async () => {
      const response = await request
        .post("/table/what_is_this/rows")
        .send({ id: 42 });
      expect(calledSaveRowWith).to.equal(undefined);
      expect(response.status).to.equal(404);
      expect(response.body).to.deep.equal({
        error: {
          message: 'Unknown table: "what_is_this"',
        },
      });
    });
  });

  describe("DELETE /table/:tableName/rows", () => {
    const schema: HelppoSchema = {
      tables: [
        {
          name: "teams",
          columns: [{ name: "id", type: "integer" }],
        },
      ],
    };
    let calledDeleteRowWith: unknown[];
    let request: SuperTest<Test>;
    beforeEach(() => {
      const driver = new MockDriver();
      calledDeleteRowWith = undefined;
      driver.deleteRow = async (...args) => {
        calledDeleteRowWith = args;
      };
      const app = driverApi(
        {
          ...baseConfig,
          driver,
          schema,
        },
        baseOptions
      );
      request = supertest(app);
    });

    it("calls driver.deleteRow and returns empty object", async () => {
      const response = await request
        .delete("/table/teams/rows")
        .query({ rowId: JSON.stringify("id42") })
        .send();
      expect(calledDeleteRowWith).to.deep.equal([schema.tables[0], "id42"]);
      expect(response.body).to.deep.equal({});
    });

    it("returns 400 if rowId is missing", async () => {
      const response = await request.delete("/table/teams/rows").send();
      expect(calledDeleteRowWith).to.equal(undefined);
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: {
          message: "Missing: rowId",
        },
      });
    });

    it("returns 404 if table is not in schema", async () => {
      const response = await request.delete("/table/what_is_this/rows").send();
      expect(calledDeleteRowWith).to.equal(undefined);
      expect(response.status).to.equal(404);
      expect(response.body).to.deep.equal({
        error: {
          message: 'Unknown table: "what_is_this"',
        },
      });
    });
  });

  describe("POST /sql", () => {
    it("calls driver.executeRawSqlQuery and returns results", async () => {
      const driver = new MockDriver();
      let calledExecuteRawSqlQueryWith = undefined;
      const mockedResponse = {
        affectedRowsAmount: 123,
        returnedRowsAmount: 42,
        columnNames: [],
        rows: [],
      };
      driver.executeRawSqlQuery = async (...args) => {
        calledExecuteRawSqlQueryWith = args;
        return mockedResponse;
      };
      const app = driverApi(
        {
          ...baseConfig,
          driver,
        },
        baseOptions
      );
      const request = supertest(app);
      const response = await request
        .post("/sql")
        .send({ sql: "drop table teams" });
      expect(calledExecuteRawSqlQueryWith).to.deep.equal(["drop table teams"]);
      expect(response.body).to.deep.equal(mockedResponse);
    });

    it("returns graceful errorMessage if an error occurs", async () => {
      const driver = new MockDriver();
      let calledExecuteRawSqlQueryWith = undefined;
      driver.executeRawSqlQuery = async (...args) => {
        calledExecuteRawSqlQueryWith = args;
        throw new Error("mocked error");
      };
      const app = driverApi(
        {
          ...baseConfig,
          driver,
        },
        baseOptions
      );
      const request = supertest(app);
      const response = await request
        .post("/sql")
        .send({ sql: "drop table teams" });
      expect(calledExecuteRawSqlQueryWith).to.deep.equal(["drop table teams"]);
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({ errorMessage: "mocked error" });
    });
  });
});
