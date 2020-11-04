import { expect } from "chai";
import {
  BrowseOptions,
  HelppoDriver,
  HelppoSchema,
  HelppoTable,
} from "../types";

const testSchema: HelppoSchema = {
  tables: [
    {
      name: "Teams",
      primaryKey: "Id",
      columns: [
        {
          name: "Id",
          type: "integer",
          autoIncrements: true,
        },
        {
          name: "Name",
          type: "string",
          maxLength: 100,
        },
        {
          name: "Description",
          type: "text",
          nullable: true,
        },
        {
          name: "CreatedAt",
          type: "datetime",
        },
        {
          name: "ActivationDate",
          type: "date",
          comment: "When this team was activated by sales",
        },
      ],
    },
    {
      name: "Users",
      primaryKey: "Id",
      columns: [
        {
          name: "Id",
          type: "integer",
          autoIncrements: true,
        },
        {
          name: "TeamId",
          type: "integer",
          referencesColumn: "Id",
          referencesTable: "Teams",
        },
        {
          name: "Email",
          type: "string",
          maxLength: 200,
        },
      ],
    },
  ],
};

const teamsTable = testSchema.tables[0];
const usersTable = testSchema.tables[1];

const baseBrowseOptions: BrowseOptions = {
  perPage: 10,
  currentPage: 1,
  filters: [],
  orderByColumn: null,
  orderByDirection: "asc",
  wildcardSearch: "",
};

// Runtime-check to ensure that the table names contain uppercase characters.
// This is to ensure that the following tests also test case-sensitiveness of database engines.
const uppercaseRegex = /[A-Z]/;
testSchema.tables.forEach((table) => {
  if (
    !uppercaseRegex.test(table.name) ||
    table.columns.some((column) => !uppercaseRegex.test(column.name))
  ) {
    throw new Error(
      "Table and column names in driverSpec.js should contain uppercase characters"
    );
  }
});

const testRows = {
  Teams: [
    {
      Id: 1,
      Name: "Team A",
      Description: null,
      CreatedAt: new Date("2020-05-15T06:17:31"),
      ActivationDate: new Date("2020-07-11T00:00:00"),
    },
    {
      Id: 2,
      Name: "Team B",
      Description: "Team description foobar...",
      CreatedAt: new Date("2020-09-25T07:09:41"),
      ActivationDate: new Date("2020-07-11T00:00:00"),
    },
    {
      Id: 3,
      Name: "Team C",
      Description: null,
      CreatedAt: new Date("2019-10-11T16:51:34"),
      ActivationDate: new Date("2019-11-05T00:00:00"),
    },
  ],
  Users: [
    { Id: 1, TeamId: 2, Email: "martti@example.com" },
    { Id: 2, TeamId: 2, Email: "dirk@example.com" },
    { Id: 3, TeamId: 1, Email: "albert@example.com" },
  ],
};

export function driverSpec(
  refObject: { driver: HelppoDriver; createTestSchema: () => Promise<void> },
  rawSqlQueries: {
    invalidQuery: string;
    invalidQueryErrorMessage: RegExp;
    selectQuery: string;
    emptySelectQuery: string;
    insertQuery: string;
    updateQuery: string;
  }
): void {
  const insertTestRows = (rows) => {
    return Promise.all(
      Object.keys(rows).map((tableName) => {
        const table = testSchema.tables.find(
          (table) => table.name === tableName
        );
        return Promise.all(
          rows[tableName].map((row) => {
            const asd = Object.assign({}, row);
            // TODO getting really messy here, should clean this up, because later row.Id is used and it could in theory not be in sync
            // Problem is that including Id desyncs sequence in postgres -> problems when inserting rows later
            delete asd.Id;
            return refObject.driver.saveRow(table, null, asd);
          })
        );
      })
    );
  };

  describe("interface", () => {
    it("exports required methods", () => {
      expect(refObject.driver).to.be.an("object");
      expect(refObject.driver.getSchema).to.be.a("function", "getSchema");
      expect(refObject.driver.getRows).to.be.a("function", "getRows");
      expect(refObject.driver.saveRow).to.be.a("function", "saveRow");
      expect(refObject.driver.deleteRow).to.be.a("function", "deleteRow");
      expect(refObject.driver.executeRawSqlQuery).to.be.a(
        "function",
        "executeRawSqlQuery"
      );
    });
  });

  describe(".getSchema", () => {
    it("returns empty schema", async () => {
      const schema = await refObject.driver.getSchema();
      expect(schema).to.deep.equal({
        tables: [],
      });
    });

    it("returns full schema", async () => {
      await refObject.createTestSchema();
      const schema = await refObject.driver.getSchema();
      expect(schema).to.deep.equal(testSchema);
    });
  });

  describe(".getRows", () => {
    beforeEach(async () => {
      await refObject.createTestSchema();
    });

    it("returns empty array", async () => {
      const result = await refObject.driver.getRows(
        teamsTable,
        baseBrowseOptions
      );
      expect(result).to.deep.equal({
        rows: [],
        totalPages: 0,
        totalResults: 0,
      });
    });

    it("returns all rows", async () => {
      await insertTestRows(testRows);
      const result = await refObject.driver.getRows(
        teamsTable,
        baseBrowseOptions
      );
      expect(result).to.deep.equal({
        rows: testRows["Teams"],
        totalPages: 1,
        totalResults: 3,
      });
    });

    describe("browseOptions.perPage", () => {
      it("works", async () => {
        await insertTestRows(testRows);

        const getPerPage = (perPage) => {
          return refObject.driver.getRows(teamsTable, {
            ...baseBrowseOptions,
            perPage,
          });
        };

        expect(await getPerPage(0)).to.deep.equal({
          rows: [],
          totalPages: 0,
          totalResults: 3,
        });
        expect(await getPerPage(1)).to.deep.equal({
          rows: testRows["Teams"].slice(0, 1),
          totalPages: 3,
          totalResults: 3,
        });
        expect(await getPerPage(2)).to.deep.equal({
          rows: testRows["Teams"].slice(0, 2),
          totalPages: 2,
          totalResults: 3,
        });
        expect(await getPerPage(3)).to.deep.equal({
          rows: testRows["Teams"].slice(0, 3),
          totalPages: 1,
          totalResults: 3,
        });
        expect(await getPerPage(4)).to.deep.equal({
          rows: testRows["Teams"].slice(0, 4),
          totalPages: 1,
          totalResults: 3,
        });
      });
    });

    describe("browseOptions.filters", () => {
      const filterRows = async (table, columnName, type, value) => {
        return (
          await refObject.driver.getRows(table, {
            ...baseBrowseOptions,
            filters: [
              {
                type,
                columnName,
                value,
              },
            ],
          })
        ).rows.map((row) => row[columnName]);
      };

      it("supports type: equals, notEquals", async () => {
        await insertTestRows(testRows);
        expect(
          await filterRows(teamsTable, "Name", "equals", "Team A")
        ).to.deep.equal(["Team A"]);
        expect(
          await filterRows(teamsTable, "Name", "notEquals", "Team A")
        ).to.deep.equal(["Team B", "Team C"]);
      });

      it("supports type: contains, notContains", async () => {
        await insertTestRows(testRows);
        expect(
          await filterRows(usersTable, "Email", "contains", "rtti")
        ).to.deep.equal(["martti@example.com"]);
        expect(
          await filterRows(usersTable, "Email", "notContains", "rtti")
        ).to.deep.equal(["dirk@example.com", "albert@example.com"]);
      });

      it("supports type: null, notNull", async () => {
        await insertTestRows(testRows);
        expect(
          await filterRows(teamsTable, "Description", "null", "")
        ).to.deep.equal([null, null]);
        expect(
          await filterRows(teamsTable, "Description", "notNull", "")
        ).to.deep.equal(["Team description foobar..."]);
      });

      it("supports type: gt, gte, lt, lte", async () => {
        await insertTestRows(testRows);
        expect(await filterRows(teamsTable, "Id", "gt", 2)).to.deep.equal([3]);
        expect(await filterRows(teamsTable, "Id", "gte", 2)).to.deep.equal([
          2,
          3,
        ]);
        expect(await filterRows(teamsTable, "Id", "lt", 2)).to.deep.equal([1]);
        expect(await filterRows(teamsTable, "Id", "lte", 2)).to.deep.equal([
          1,
          2,
        ]);
      });
    });

    describe("browseOptions.wildcardSearch", () => {
      const searchRows = async (table, wildcardSearch, returnColumnName) => {
        return (
          await refObject.driver.getRows(table, {
            ...baseBrowseOptions,
            wildcardSearch,
          })
        ).rows.map((row) => row[returnColumnName]);
      };

      it("searches from text columns", async () => {
        await insertTestRows(testRows);
        expect(await searchRows(usersTable, "test", "Email")).to.deep.equal([]);
        expect(await searchRows(usersTable, "rtti", "Email")).to.deep.equal([
          "martti@example.com",
        ]);
        expect(await searchRows(usersTable, "t", "Email")).to.deep.equal([
          "martti@example.com",
          "albert@example.com",
        ]);
      });

      it("does not search from secret columns", async () => {
        await insertTestRows(testRows);
        const withSecretEmail: HelppoTable = {
          ...usersTable,
          columns: usersTable.columns.map((column) => {
            if (column.name === "Email") {
              return {
                ...column,
                secret: true,
              };
            }
            return column;
          }),
        };
        expect(
          await searchRows(withSecretEmail, "rtti", "Email")
        ).to.deep.equal([]);
      });
    });

    describe("browseOptions.orderByColumn and browseOptions.orderByDirection", () => {
      it("works", async () => {
        await insertTestRows(testRows);
        const getRows = async (orderByDirection) => {
          return (
            await refObject.driver.getRows(usersTable, {
              ...baseBrowseOptions,
              orderByColumn: "TeamId",
              orderByDirection,
            })
          ).rows.map((row) => row.TeamId);
        };
        expect(await getRows("asc")).to.deep.equal([1, 2, 2]);
        expect(await getRows("desc")).to.deep.equal([2, 2, 1]);
      });
    });
  });

  describe(".saveRow", () => {
    beforeEach(async () => {
      await refObject.createTestSchema();
    });

    it("creates row", async () => {
      const exampleRow = {
        Name: "Team Foobar",
        Description: null,
        CreatedAt: "2020-05-15 06:17:31",
        ActivationDate: "2020-07-11",
      };
      const result = await refObject.driver.saveRow(
        teamsTable,
        null,
        exampleRow
      );
      expect(result).to.deep.equal({
        Id: 1,
        Name: "Team Foobar",
        Description: null,
        CreatedAt: new Date("2020-05-15T06:17:31"),
        ActivationDate: new Date("2020-07-11T00:00:00"),
      });
    });

    it("does not overwrite existing row", async () => {
      await insertTestRows(testRows);
      const existingRow = {
        Id: testRows["Teams"][0].Id,
        Name: "Overwriting",
        Description: null,
        CreatedAt: "2020-05-15 06:17:31",
        ActivationDate: "2020-07-11",
      };
      await expect(
        refObject.driver.saveRow(teamsTable, null, existingRow)
      ).to.be.rejectedWith(
        /ER_DUP_ENTRY|duplicate key value violates unique constraint/
      );
    });

    it("updates existing row if rowId is present", async () => {
      await insertTestRows(testRows);
      const rowId = testRows["Teams"][0].Id;
      const updated = {
        Name: "Updating name",
      };
      const result = await refObject.driver.saveRow(teamsTable, rowId, updated);
      expect(result).to.deep.equal({
        Id: rowId,
        Name: "Updating name",
        Description: null,
        CreatedAt: new Date("2020-05-15T06:17:31"),
        ActivationDate: new Date("2020-07-11T00:00:00"),
      });
    });

    it("throws on foreign key constraint failure", async () => {
      await insertTestRows(testRows);
      const exampleRow = Object.assign({}, testRows["Users"][0]);
      delete exampleRow[teamsTable.primaryKey];
      exampleRow.Id = 345345;
      exampleRow.TeamId = 123123123;
      await expect(
        refObject.driver.saveRow(usersTable, null, exampleRow)
      ).to.be.rejected.then((error) => {
        expect(error.message).to.equal("Foreign key constraint failed");
      });
    });

    it("throws on null given to non-nullable columns", async () => {
      await insertTestRows(testRows);
      const exampleRow = Object.assign({}, testRows["Users"][0]);
      delete exampleRow[teamsTable.primaryKey];
      exampleRow.TeamId = null;
      await expect(
        refObject.driver.saveRow(usersTable, null, exampleRow)
      ).to.be.rejected.then((error) => {
        expect(error.message).to.equal("Column TeamId is not nullable");
      });
    });
  });

  describe(".deleteRow", () => {
    beforeEach(async () => {
      await refObject.createTestSchema();
      await insertTestRows(testRows);
    });

    it("deletes row", async () => {
      const rowsBefore = await refObject.driver.getRows(
        usersTable,
        baseBrowseOptions
      );

      const exampleRow = testRows["Users"][0];
      const rowId = exampleRow[usersTable.primaryKey];
      await refObject.driver.deleteRow(usersTable, rowId);

      const rowsAfter = await refObject.driver.getRows(
        usersTable,
        baseBrowseOptions
      );

      expect(rowsAfter.totalResults).to.be.above(0);
      expect(rowsBefore.totalResults - rowsAfter.totalResults).to.equal(1);
      expect(rowsBefore.rows.find((row) => row.Id === rowId)).to.not.be.an(
        "undefined"
      );
      expect(rowsAfter.rows.find((row) => row.Id === rowId)).to.be.an(
        "undefined"
      );
    });
  });

  describe(".executeRawSqlQuery", () => {
    beforeEach(async () => {
      await refObject.createTestSchema();
      await insertTestRows(testRows);
    });

    it("throws SQL error", async () => {
      await expect(
        refObject.driver.executeRawSqlQuery(rawSqlQueries.invalidQuery)
      ).to.be.rejectedWith(rawSqlQueries.invalidQueryErrorMessage);
    });

    it("returns select results", async () => {
      const result = await refObject.driver.executeRawSqlQuery(
        rawSqlQueries.selectQuery
      );
      expect(result).to.deep.equal({
        affectedRowsAmount: 0,
        columnNames: ["Id", "Email"],
        returnedRowsAmount: 3,
        rows: [
          [1, "martti@example.com"],
          [2, "dirk@example.com"],
          [3, "albert@example.com"],
        ],
      });
    });

    it("returns empty select results", async () => {
      const result = await refObject.driver.executeRawSqlQuery(
        rawSqlQueries.emptySelectQuery
      );
      expect(result).to.deep.equal({
        affectedRowsAmount: 0,
        columnNames: [],
        returnedRowsAmount: 0,
        rows: [],
      });
    });

    it("returns insert results", async () => {
      const result = await refObject.driver.executeRawSqlQuery(
        rawSqlQueries.insertQuery
      );
      expect(result).to.deep.equal({
        affectedRowsAmount: 2,
        columnNames: [],
        returnedRowsAmount: 0,
        rows: [],
      });
    });

    it("returns update results", async () => {
      const result = await refObject.driver.executeRawSqlQuery(
        rawSqlQueries.updateQuery
      );
      expect(result).to.deep.equal({
        affectedRowsAmount: 2,
        columnNames: [],
        returnedRowsAmount: 0,
        rows: [],
      });
    });
  });
}
