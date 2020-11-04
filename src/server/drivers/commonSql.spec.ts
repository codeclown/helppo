import { expect } from "chai";
import { mysqlQueryFormatter } from "./MysqlDriver";
import {
  selectRows,
  countRows,
  updateRow,
  insertRow,
  deleteRow,
} from "./commonSql";

// Using mysqlQueryFormatter because it nicely differentiates identifiers and values

describe("commonSql", () => {
  describe("selectRows", () => {
    it("returns SELECT query", () => {
      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", 10, 0],
        sql: "SELECT ?? FROM ?? LIMIT ? OFFSET ? ",
      });
    });

    it("ordering", () => {
      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [],
            orderByColumn: "Name",
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal(
        {
          params: [["Id", "Name"], "FooBar", "Name", 10, 0],
          sql: "SELECT ?? FROM ?? ORDER BY ?? ASC LIMIT ? OFFSET ? ",
        },
        "asc"
      );

      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [],
            orderByColumn: "Name",
            orderByDirection: "desc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal(
        {
          params: [["Id", "Name"], "FooBar", "Name", 10, 0],
          sql: "SELECT ?? FROM ?? ORDER BY ?? DESC LIMIT ? OFFSET ? ",
        },
        "desc"
      );
    });

    it("pagination", () => {
      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 42,
            currentPage: 5,
            filters: [],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", 42, 168],
        sql: "SELECT ?? FROM ?? LIMIT ? OFFSET ? ",
      });
    });

    it("filters", () => {
      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [{ type: "equals", columnName: "Name", value: "foo_bar" }],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", "Name", "foo_bar", 10, 0],
        sql: "SELECT ?? FROM ?? WHERE ?? = ? LIMIT ? OFFSET ? ",
      });

      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [
              { type: "notEquals", columnName: "Name", value: "foo_bar" },
            ],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", "Name", "foo_bar", 10, 0],
        sql: "SELECT ?? FROM ?? WHERE ?? != ? LIMIT ? OFFSET ? ",
      });

      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [
              { type: "contains", columnName: "Name", value: "foo_bar" },
            ],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", "Name", "%foo_bar%", 10, 0],
        sql: "SELECT ?? FROM ?? WHERE ?? LIKE ? LIMIT ? OFFSET ? ",
      });

      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [
              { type: "notContains", columnName: "Name", value: "foo_bar" },
            ],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", "Name", "%foo_bar%", 10, 0],
        sql: "SELECT ?? FROM ?? WHERE ?? NOT LIKE ? LIMIT ? OFFSET ? ",
      });

      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [{ type: "null", columnName: "Name", value: "" }],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", "Name", 10, 0],
        sql: "SELECT ?? FROM ?? WHERE ?? IS NULL LIMIT ? OFFSET ? ",
      });

      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [{ type: "notNull", columnName: "Name", value: "" }],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", "Name", 10, 0],
        sql: "SELECT ?? FROM ?? WHERE ?? IS NOT NULL LIMIT ? OFFSET ? ",
      });

      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [{ type: "gt", columnName: "Name", value: 42 }],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", "Name", 42, 10, 0],
        sql: "SELECT ?? FROM ?? WHERE ?? > ? LIMIT ? OFFSET ? ",
      });

      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [{ type: "gte", columnName: "Name", value: 42 }],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", "Name", 42, 10, 0],
        sql: "SELECT ?? FROM ?? WHERE ?? >= ? LIMIT ? OFFSET ? ",
      });

      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [{ type: "lt", columnName: "Name", value: 42 }],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", "Name", 42, 10, 0],
        sql: "SELECT ?? FROM ?? WHERE ?? < ? LIMIT ? OFFSET ? ",
      });

      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [{ type: "lte", columnName: "Name", value: 42 }],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [["Id", "Name"], "FooBar", "Name", 42, 10, 0],
        sql: "SELECT ?? FROM ?? WHERE ?? <= ? LIMIT ? OFFSET ? ",
      });
    });

    it("multiple filters", () => {
      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [
              { type: "equals", columnName: "Name", value: "foo_bar" },
              { type: "notContains", columnName: "Name", value: "hmm" },
            ],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [
          ["Id", "Name"],
          "FooBar",
          "Name",
          "foo_bar",
          "Name",
          "%hmm%",
          10,
          0,
        ],
        sql:
          "SELECT ?? FROM ?? WHERE ?? = ? AND ?? NOT LIKE ? LIMIT ? OFFSET ? ",
      });
    });

    it("widcard search", () => {
      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "find stuff",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [
          ["Id", "Name"],
          "FooBar",
          "Id",
          "%find stuff%",
          "Name",
          "%find stuff%",
          10,
          0,
        ],
        sql: "SELECT ?? FROM ?? WHERE ?? LIKE ? OR ?? LIKE ? LIMIT ? OFFSET ? ",
      });
    });

    it("widcard search and filters", () => {
      expect(
        selectRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [
              { type: "equals", columnName: "Name", value: "foo_bar" },
              { type: "notContains", columnName: "Name", value: "hmm" },
            ],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "find stuff",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [
          ["Id", "Name"],
          "FooBar",
          "Name",
          "foo_bar",
          "Name",
          "%hmm%",
          "Id",
          "%find stuff%",
          "Name",
          "%find stuff%",
          10,
          0,
        ],
        sql:
          "SELECT ?? FROM ?? WHERE ?? = ? AND ?? NOT LIKE ? AND ( ?? LIKE ? OR ?? LIKE ? ) LIMIT ? OFFSET ? ",
      });
    });
  });

  describe("countRows", () => {
    it("returns SELECT query", () => {
      expect(
        countRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: ["amount", "FooBar"],
        sql: "SELECT COUNT(*) as ?? FROM ?? ",
      });
    });

    it("includes filters and wildcardSearch", () => {
      expect(
        countRows(
          "FooBar",
          ["Id", "Name"],
          {
            perPage: 10,
            currentPage: 1,
            filters: [
              { type: "equals", columnName: "Name", value: "foo_bar" },
              { type: "notContains", columnName: "Name", value: "hmm" },
            ],
            orderByColumn: null,
            orderByDirection: "asc",
            wildcardSearch: "find stuff",
          },
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [
          "amount",
          "FooBar",
          "Name",
          "foo_bar",
          "Name",
          "%hmm%",
          "Id",
          "%find stuff%",
          "Name",
          "%find stuff%",
        ],
        sql:
          "SELECT COUNT(*) as ?? FROM ?? WHERE ?? = ? AND ?? NOT LIKE ? AND ( ?? LIKE ? OR ?? LIKE ? ) ",
      });
    });
  });

  describe("updateRow", () => {
    it("returns UPDATE query", () => {
      expect(
        updateRow(
          "FooBar",
          "Id",
          42,
          ["Name"],
          ["New Name"],
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: ["FooBar", "Name", "New Name", "Id", 42],
        sql: "UPDATE ?? SET ?? = ? WHERE ?? = ? ",
      });

      expect(
        updateRow(
          "FooBar",
          "Id",
          42,
          ["Name", "EmailAddress"],
          ["New Name", "New EmailAddress"],
          mysqlQueryFormatter
        )
      ).to.deep.equal({
        params: [
          "FooBar",
          "Name",
          "New Name",
          "EmailAddress",
          "New EmailAddress",
          "Id",
          42,
        ],
        sql: "UPDATE ?? SET ?? = ? AND ?? = ? WHERE ?? = ? ",
      });
    });
  });

  describe("insertRow", () => {
    it("returns INSERT query", () => {
      expect(
        insertRow("FooBar", ["Name"], ["New Name"], null, mysqlQueryFormatter)
      ).to.deep.equal({
        params: ["FooBar", "Name", "New Name"],
        sql: "INSERT INTO ?? ( ?? ) VALUES ( ? ) ",
      });
    });
  });

  describe("deleteRow", () => {
    it("returns DELETE query", () => {
      expect(deleteRow("FooBar", "Id", 42, mysqlQueryFormatter)).to.deep.equal({
        params: ["FooBar", "Id", 42],
        sql: "DELETE FROM ?? WHERE ?? = ? ",
      });
    });
  });
});
