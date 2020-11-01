import { expect } from "chai";
import matchSnapshot from "snap-shot-it";
import builtInFilterTypes from "../builtInFilterTypes";

const testSchema = {
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

const baseBrowseOptions = {
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

export function schemaSqlSpecHelper(createSql) {
  it("no tables", () => {
    matchSnapshot(
      createSql({
        tables: [],
      })
    );
  });

  it("table without columns", () => {
    matchSnapshot(
      createSql({
        tables: [
          {
            name: "Foobar",
            columns: [],
          },
        ],
      })
    );
  });

  it("multiple tables", () => {
    matchSnapshot(
      createSql({
        tables: [
          {
            name: "Foobar1",
            columns: [],
          },
          {
            name: "Foobar2",
            columns: [],
          },
        ],
      })
    );
  });

  it("different column types", () => {
    matchSnapshot(
      createSql({
        tables: [
          {
            name: "Foobar",
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
              },
            ],
          },
        ],
      })
    );
  });

  it("primary key", () => {
    matchSnapshot(
      createSql({
        tables: [
          {
            name: "Foobar",
            primaryKey: "Id",
            columns: [
              {
                name: "Id",
                type: "integer",
                autoIncrements: true,
              },
            ],
          },
        ],
      })
    );
  });

  it("foreign keys", () => {
    matchSnapshot(
      createSql({
        tables: [
          {
            name: "Foobar",
            columns: [
              {
                name: "TeamId",
                type: "integer",
                referencesColumn: "Id",
                referencesTable: "Teams",
              },
            ],
          },
        ],
      })
    );
  });

  it("comments", () => {
    matchSnapshot(
      createSql({
        tables: [
          {
            name: "Foobar",
            primaryKey: "Id",
            columns: [
              {
                name: "Id",
                type: "integer",
                comment: "foobar comment",
              },
            ],
          },
        ],
      })
    );
  });
}

export function driverSpec(refObject, { rawSqlQueries }) {
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

  const teamsTable = testSchema.tables.find((table) => table.name === "Teams");
  const usersTable = testSchema.tables.find((table) => table.name === "Users");

  describe("interface", () => {
    it("exports required methods", () => {
      expect(refObject.driver).to.be.an("object");
      expect(refObject.driver.__createSchema).to.be.a(
        "function",
        "__createSchema"
      );
      expect(refObject.driver.getSchema).to.be.a("function", "getSchema");
      expect(refObject.driver.getTableRows).to.be.a("function", "getTableRows");
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
      await refObject.driver.__createSchema(testSchema);
      await insertTestRows(testRows);
      const schema = await refObject.driver.getSchema();
      expect(schema).to.deep.equal(testSchema);
    });
  });

  describe(".getTableRows", () => {
    beforeEach(async () => {
      await refObject.driver.__createSchema(testSchema);
    });

    it("returns empty array", async () => {
      const result = await refObject.driver.getTableRows(
        teamsTable.name,
        teamsTable.columns.map((column) => column.name),
        [],
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
      const result = await refObject.driver.getTableRows(
        teamsTable.name,
        teamsTable.columns.map((column) => column.name),
        [],
        baseBrowseOptions
      );
      expect(result).to.deep.equal({
        rows: testRows["Teams"],
        totalPages: 1,
        totalResults: 3,
      });
    });

    it("returns only specified columns", async () => {
      await insertTestRows(testRows);
      const result = await refObject.driver.getTableRows(
        teamsTable.name,
        ["Id"],
        [],
        baseBrowseOptions
      );
      expect(result).to.deep.equal({
        rows: testRows["Teams"].map((row) => {
          return {
            Id: row.Id,
          };
        }),
        totalPages: 1,
        totalResults: 3,
      });
    });

    describe("browseOptions.perPage", () => {
      it("is validated", async () => {
        const invalidValues = [null, undefined, 0.3, "", false, true, {}, []];
        for (let invalidValue of invalidValues) {
          await expect(
            refObject.driver.getTableRows(
              teamsTable.name,
              teamsTable.columns.map((column) => column.name),
              [],
              {
                ...baseBrowseOptions,
                perPage: invalidValue,
              }
            )
          ).to.be.rejectedWith(
            "Expected browseOptions.perPage to be an integer"
          );
        }
      });

      it("works", async () => {
        await insertTestRows(testRows);

        const getPerPage = (perPage) => {
          return refObject.driver.getTableRows(
            teamsTable.name,
            teamsTable.columns.map((column) => column.name),
            [],
            {
              ...baseBrowseOptions,
              perPage,
            }
          );
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
      it("is validated", async () => {
        const invalidValues = [
          null,
          undefined,
          0.3,
          "",
          false,
          true,
          {},
          ["asd"],
        ];
        for (let invalidValue of invalidValues) {
          await expect(
            refObject.driver.getTableRows(
              teamsTable.name,
              teamsTable.columns.map((column) => column.name),
              builtInFilterTypes.map((filterType) => filterType.key),
              {
                ...baseBrowseOptions,
                filters: invalidValue,
              }
            )
          ).to.be.rejectedWith(
            "Expected browseOptions.filters to be an array of objects"
          );
        }

        const invalidTypes = [null, undefined, 0.3, "", false, true, {}, []];
        for (let invalidType of invalidTypes) {
          await expect(
            refObject.driver.getTableRows(
              teamsTable.name,
              teamsTable.columns.map((column) => column.name),
              builtInFilterTypes.map((filterType) => filterType.key),
              {
                ...baseBrowseOptions,
                filters: [{ type: invalidType, columnName: "Id", value: 1 }],
              }
            )
          ).to.be.rejectedWith(
            "Expected browseOptions.filters[].type to be one of equals, notEquals, contains, notContains, null, notNull, gt, gte, lt, lte"
          );
        }

        await expect(
          refObject.driver.getTableRows(
            teamsTable.name,
            teamsTable.columns.map((column) => column.name),
            builtInFilterTypes.map((filterType) => filterType.key),
            {
              ...baseBrowseOptions,
              filters: [
                { type: "equals", columnName: "not_exist_123", value: 1 },
              ],
            }
          )
        ).to.be.rejectedWith(
          "Expected browseOptions.filters[].columnName to be included in columnNames"
        );
      });

      const filterRows = async (table, columnName, type, value) => {
        return (
          await refObject.driver.getTableRows(
            table.name,
            table.columns.map((column) => column.name),
            builtInFilterTypes.map((filterType) => filterType.key),
            {
              ...baseBrowseOptions,
              filters: [
                {
                  type,
                  columnName,
                  value,
                },
              ],
            }
          )
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
      it("is validated", async () => {
        const invalidValues = [null, undefined, 0.3, false, true, {}, []];
        for (let invalidValue of invalidValues) {
          await expect(
            refObject.driver.getTableRows(
              teamsTable.name,
              teamsTable.columns.map((column) => column.name),
              [],
              {
                ...baseBrowseOptions,
                wildcardSearch: invalidValue,
              }
            )
          ).to.be.rejectedWith(
            "Expected browseOptions.wildcardSearch to be a string"
          );
        }
      });

      // TODO
      // const searchRows = async (table, wildcardSearch, returnColumnName) => {
      //   return (
      //     await refObject.driver.getTableRows(
      //       table.name,
      //       table.columns.map((column) => column.name),
      //       builtInFilterTypes.map((filterType) => filterType.key),
      //       {
      //         ...baseBrowseOptions,
      //         wildcardSearch,
      //       }
      //     )
      //   ).rows.map((row) => row[returnColumnName]);
      // };
      // it("searches text-based columns", async () => {
      //   await insertTestRows(testRows);
      //   expect(await searchRows(teamsTable, "rtti", "Name")).to.deep.equal([
      //     "Mar",
      //   ]);
      // });
    });

    describe("browseOptions.orderByColumn and browseOptions.orderByDirection", () => {
      it("orderByColumn is validated", async () => {
        const invalidValues = [undefined, 0.3, "", false, true, {}, ["asd"]];
        for (let invalidValue of invalidValues) {
          await expect(
            refObject.driver.getTableRows(
              teamsTable.name,
              teamsTable.columns.map((column) => column.name),
              [],
              {
                ...baseBrowseOptions,
                orderByColumn: invalidValue,
              }
            )
          ).to.be.rejectedWith(
            "Expected browseOptions.orderByColumn to be null or included in columnNames"
          );
        }
      });

      it("orderByDirection is validated", async () => {
        const invalidValues = [
          null,
          undefined,
          0.3,
          "",
          false,
          true,
          {},
          ["asd"],
          "ASC",
          "DESC",
        ];
        for (let invalidValue of invalidValues) {
          await expect(
            refObject.driver.getTableRows(
              teamsTable.name,
              teamsTable.columns.map((column) => column.name),
              [],
              {
                ...baseBrowseOptions,
                orderByDirection: invalidValue,
              }
            )
          ).to.be.rejectedWith(
            "Expected browseOptions.orderByDirection to be 'asc' or 'desc'"
          );
        }
      });

      it("works", async () => {
        await insertTestRows(testRows);
        const getRows = async (orderByDirection) => {
          return (
            await refObject.driver.getTableRows(
              usersTable.name,
              usersTable.columns.map((column) => column.name),
              [],
              {
                ...baseBrowseOptions,
                orderByColumn: "TeamId",
                orderByDirection,
              }
            )
          ).rows.map((row) => row.TeamId);
        };
        expect(await getRows("asc")).to.deep.equal([1, 2, 2]);
        expect(await getRows("desc")).to.deep.equal([2, 2, 1]);
      });
    });
  });

  describe(".saveRow", () => {
    beforeEach(async () => {
      await refObject.driver.__createSchema(testSchema);
    });

    it("creates row", async () => {
      const exampleRow = Object.assign({}, testRows["Teams"][0]);
      delete exampleRow[teamsTable.primaryKey];
      const result = await refObject.driver.saveRow(
        teamsTable,
        null,
        exampleRow
      );
      expect(result).to.deep.equal({
        ...exampleRow,
        Id: 1,
      });
    });

    it("does not overwrite existing row", async () => {
      await insertTestRows(testRows);
      const exampleRow = Object.assign({}, testRows["Teams"][0], {
        Name: "foobar!",
      });
      await expect(
        refObject.driver.saveRow(teamsTable, null, exampleRow)
      ).to.be.rejectedWith(
        /ER_DUP_ENTRY|duplicate key value violates unique constraint/
      );
    });

    it("updates existing row if rowId is present", async () => {
      await insertTestRows(testRows);
      const exampleRow = Object.assign({}, testRows["Teams"][0], {
        Name: "foobar!",
      });
      const result = await refObject.driver.saveRow(
        teamsTable,
        exampleRow.Id,
        exampleRow
      );
      expect(result).to.deep.equal(exampleRow);
    });

    it("accepts object without all columns", async () => {
      await insertTestRows(testRows);
      const exampleRow = {
        Id: testRows["Teams"][0].Id,
        Name: "foobar!",
      };
      const result = await refObject.driver.saveRow(
        teamsTable,
        exampleRow.Id,
        exampleRow
      );
      expect(result).to.deep.equal(
        Object.assign({}, testRows["Teams"][0], {
          Name: "foobar!",
        })
      );
    });

    it("only allows column names that are specified in schema", async () => {
      await insertTestRows(testRows);
      const modifiedTeamsTable = Object.assign({}, teamsTable, {
        columns: teamsTable.columns.filter((column) => {
          if (column.name === "Name") {
            return false;
          }
          return true;
        }),
      });
      const exampleRow = {
        Id: testRows["Teams"][0].Id,
        Name: "foobar!",
      };
      const result = await refObject.driver.saveRow(
        modifiedTeamsTable,
        exampleRow.Id,
        exampleRow
      );
      expect(result.Name).to.equal(undefined, "returned does not show Name");
      const fullRows = await refObject.driver.getTableRows(
        teamsTable.name,
        ["Id", "Name"],
        [],
        {
          ...baseBrowseOptions,
          filters: [
            {
              type: "equals",
              columnName: "Id",
              value: testRows["Teams"][0].Id,
            },
          ],
        }
      );
      expect(fullRows.rows[0]).to.deep.equal(
        { Id: testRows["Teams"][0].Id, Name: testRows["Teams"][0].Name },
        "Name was not modified"
      );
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
      await refObject.driver.__createSchema(testSchema);
      await insertTestRows(testRows);
    });

    it("deletes row", async () => {
      const rowsBefore = await refObject.driver.getTableRows(
        usersTable.name,
        usersTable.columns.map((column) => column.name),
        [],
        baseBrowseOptions
      );

      const exampleRow = testRows["Users"][0];
      const rowId = exampleRow[usersTable.primaryKey];
      await refObject.driver.deleteRow(usersTable, rowId);

      const rowsAfter = await refObject.driver.getTableRows(
        usersTable.name,
        usersTable.columns.map((column) => column.name),
        [],
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
      await refObject.driver.__createSchema(testSchema);
      await insertTestRows(testRows);
    });

    it("returns error", async () => {
      const result = await refObject.driver.executeRawSqlQuery(
        rawSqlQueries.invalidQuery
      );
      expect(result).to.deep.equal({
        errorMessage: rawSqlQueries.invalidQueryErrorMessage,
      });
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
