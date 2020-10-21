import matchSnapshot from "snap-shot-it";
import { schemaSqlSpecHelper } from "./driverSpec";
import { createMysqlSchemaSql } from "./MysqlDriver";
import {
  getTablesSql,
  getIndexesSql,
  getForeignKeysSql,
  getColumnsSql,
  getSelectSql,
  getCountSql,
  getUpdateRowSql,
  getInsertRowSql,
  getDeleteRowSql,
} from "./mysqlSql";

describe("mysqlSql", () => {
  describe("createMysqlSchemaSql", () => {
    // eslint-disable-next-line mocha/no-setup-in-describe
    schemaSqlSpecHelper(createMysqlSchemaSql);
  });

  describe("getTablesSql", () => {
    it("works", () => {
      matchSnapshot(getTablesSql());
    });
  });

  describe("getIndexesSql", () => {
    it("works", () => {
      matchSnapshot(getIndexesSql([]));
      matchSnapshot(getIndexesSql(["users"]));
      matchSnapshot(getIndexesSql(["users", "tables"]));
    });
  });

  describe("getForeignKeysSql", () => {
    it("works", () => {
      matchSnapshot(getForeignKeysSql([]));
      matchSnapshot(getForeignKeysSql(["users"]));
      matchSnapshot(getForeignKeysSql(["users", "tables"]));
    });
  });

  describe("getColumnsSql", () => {
    it("works", () => {
      matchSnapshot(getColumnsSql([]));
      matchSnapshot(getColumnsSql(["users"]));
      matchSnapshot(getColumnsSql(["users", "tables"]));
    });
  });

  describe("getSelectSql", () => {
    it("works", () => {
      matchSnapshot(
        getSelectSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it("calculates pagination", () => {
      matchSnapshot(
        getSelectSql("users", ["id"], {
          perPage: 15,
          currentPage: 8,
          filters: [],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it('adds "equals" filter', () => {
      matchSnapshot(
        getSelectSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "equals",
              columnName: "name",
              value: "foobar",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it('adds "notEquals" filter', () => {
      matchSnapshot(
        getSelectSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "notEquals",
              columnName: "name",
              value: "foobar",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it('adds "contains" filter', () => {
      matchSnapshot(
        getSelectSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "contains",
              columnName: "name",
              value: "foobar",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it('adds "notContains" filter', () => {
      matchSnapshot(
        getSelectSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "notContains",
              columnName: "name",
              value: "foobar",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it('adds "null" filter', () => {
      matchSnapshot(
        getSelectSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "null",
              columnName: "name",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it('adds "notNull" filter', () => {
      matchSnapshot(
        getSelectSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "notNull",
              columnName: "name",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it('adds "gt" filter', () => {
      matchSnapshot(
        getSelectSql("users", ["id", "createdAt"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "gt",
              columnName: "createdAt",
              value: "2020-10-20 14:16:00",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it('adds "gte" filter', () => {
      matchSnapshot(
        getSelectSql("users", ["id", "createdAt"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "gte",
              columnName: "createdAt",
              value: "2020-10-20 14:16:00",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it('adds "lt" filter', () => {
      matchSnapshot(
        getSelectSql("users", ["id", "createdAt"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "lt",
              columnName: "createdAt",
              value: "2020-10-20 14:16:00",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it('adds "lte" filter', () => {
      matchSnapshot(
        getSelectSql("users", ["id", "createdAt"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "lte",
              columnName: "createdAt",
              value: "2020-10-20 14:16:00",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it("adds multiple filters", () => {
      matchSnapshot(
        getSelectSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "equals",
              columnName: "name",
              value: "foobar1",
            },
            {
              type: "equals",
              columnName: "name",
              value: "foobar2",
            },
          ],
          orderByColumn: null,
          orderByDirection: "asc",
        })
      );
    });

    it("adds order by", () => {
      matchSnapshot(
        getSelectSql("users", ["id"], {
          perPage: 1,
          currentPage: 1,
          filters: [],
          orderByColumn: "id",
          orderByDirection: "asc",
        })
      );
      matchSnapshot(
        getSelectSql("users", ["id"], {
          perPage: 1,
          currentPage: 1,
          filters: [],
          orderByColumn: "id",
          orderByDirection: "desc",
        })
      );
    });
  });

  describe("getCountSql", () => {
    it("works", () => {
      matchSnapshot(
        getCountSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [],
        })
      );
    });

    it("calculates pagination", () => {
      matchSnapshot(
        getCountSql("users", ["id"], {
          perPage: 15,
          currentPage: 8,
          filters: [],
        })
      );
    });

    it('adds "equals" filter', () => {
      matchSnapshot(
        getCountSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "equals",
              columnName: "name",
              value: "foobar",
            },
          ],
        })
      );
    });

    it("adds multiple filters", () => {
      matchSnapshot(
        getCountSql("users", ["id", "name"], {
          perPage: 1,
          currentPage: 1,
          filters: [
            {
              type: "equals",
              columnName: "name",
              value: "foobar1",
            },
            {
              type: "equals",
              columnName: "name",
              value: "foobar2",
            },
          ],
        })
      );
    });
  });

  describe("getUpdateRowSql", () => {
    it("works", () => {
      matchSnapshot(getUpdateRowSql("users", "id", 123, ["name"], ["foobar"]));
      matchSnapshot(
        getUpdateRowSql(
          "users",
          "id",
          123,
          ["name", "description"],
          ["foobar1", "foobar2"]
        )
      );
    });
  });

  describe("getInsertRowSql", () => {
    it("works", () => {
      matchSnapshot(getInsertRowSql("users", ["name"], ["foobar"]));
      matchSnapshot(
        getInsertRowSql(
          "users",
          ["name", "description"],
          ["foobar1", "foobar2"]
        )
      );
    });
  });

  describe("getDeleteRowSql", () => {
    it("works", () => {
      matchSnapshot(getDeleteRowSql("users", "id", 123));
    });
  });
});
