import { expect } from "chai";
import { HelppoColumn, HelppoSchema } from "../sharedTypes";
import findColumnRelations from "./findColumnRelations";

describe("findColumnRelations", () => {
  const baseSchema: HelppoSchema = {
    tables: [
      {
        name: "teams",
        primaryKey: "id",
        columns: [
          {
            name: "id",
            type: "integer",
            autoIncrements: true,
          },
        ],
      },
      {
        name: "users",
        primaryKey: "id",
        columns: [
          {
            name: "id",
            type: "integer",
            autoIncrements: true,
          },
          {
            name: "foobar",
            type: "integer",
          },
        ],
      },
    ],
  };

  // Helper function to find specific users table column from the nested schema
  const findUsersColumn = (schema: HelppoSchema, name: string): HelppoColumn =>
    schema.tables
      .find((table) => table.name === "users")
      .columns.find((column) => column.name === name);

  it("does not change anything if columns do not indicate relations", () => {
    expect(findColumnRelations(baseSchema)).to.deep.equal(baseSchema);
  });

  it("adds properties if column name indicates relation", () => {
    const indicativeColumnNames = [
      "teamid",
      "teamsid",
      "team_id",
      "teams_id",
      "teamId",
      "teamsId",
      "team_Id",
      "teams_Id",
      "teamID",
      "teamsID",
      "team_ID",
      "teams_ID",
    ];

    for (const columnName of indicativeColumnNames) {
      const schema: HelppoSchema = JSON.parse(JSON.stringify(baseSchema));

      // Change column name to one of the above
      findUsersColumn(schema, "foobar").name = columnName;

      const result = findColumnRelations(schema);

      // Column should now have relation properties
      const updatedColumn = findUsersColumn(result, columnName);
      expect(updatedColumn.referencesTable).to.equal(
        "teams",
        `match for ${columnName}`
      );
      expect(updatedColumn.referencesColumn).to.equal("id");
    }
  });

  it("does not change anything if no matching table is found", () => {
    const schema: HelppoSchema = JSON.parse(JSON.stringify(baseSchema));

    // Change column name to a match
    findUsersColumn(schema, "foobar").name = "teams_id";

    // Also change teams table name
    schema.tables.find((table) => table.name === "teams").name = "heyo";

    expect(findColumnRelations(schema)).to.deep.equal(schema);
  });

  it("does not change anything if foreign keys were already found", () => {
    const schema: HelppoSchema = JSON.parse(JSON.stringify(baseSchema));
    const targetColumn = findUsersColumn(schema, "foobar");

    // Change column name to a match
    targetColumn.name = "teams_id";

    // Also make it so that relation was deducted from foreign keys already.
    // To be sure it's not silently overriden, make the relations different
    // from what findColumnRelations would choose.
    targetColumn.referencesTable = "foobar_things";
    targetColumn.referencesColumn = "guid";

    expect(findColumnRelations(schema)).to.deep.equal(schema);
  });
});
