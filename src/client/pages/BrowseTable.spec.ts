import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";
import { createMemoryHistory } from "history";
import { createElement as h } from "react";
import { Router } from "react-router-dom";
import sinon from "sinon";
import { ApiResponseGetRows } from "../../sharedTypes";
import Api, { MockApi } from "../Api";
import Images from "../Images";
import Urls from "../Urls";
import ColumnTypeString from "../components/ColumnTypeString";
import BrowseTable, { BrowseTableProps } from "./BrowseTable";

const baseProps: BrowseTableProps = {
  api: new MockApi("<mountpath>"),
  urls: new Urls("<mountpath>"),
  images: new Images("<mountpath>"),
  columnTypeComponents: {
    string: ColumnTypeString,
  },
  filterTypes: [
    {
      key: "equals",
      name: "equals",
      columnTypes: ["string"],
    },
    {
      key: "notEquals",
      name: "does not equal",
      columnTypes: ["string"],
    },
  ],
  catchApiError: async (promise) => {
    return promise;
  },
  showNotification: () => {
    // do nothing
  },
  rememberDeletedRow: () => {
    // do nothing
  },
  table: {
    name: "test_table",
    primaryKey: "id",
    columns: [
      {
        name: "id",
        type: "string",
      },
      {
        name: "name",
        type: "string",
      },
    ],
  },
  relations: [],
};

describe("BrowseTable", () => {
  let api: Api;
  let apiMock: sinon.SinonMock;

  beforeEach(() => {
    api = new MockApi("/<mountpath>");
    apiMock = sinon.mock(api);
  });

  afterEach(() => {
    apiMock.verify();
  });

  it("renders table", () => {
    render(
      h(
        Router,
        { history: createMemoryHistory() },
        h(BrowseTable, { ...baseProps })
      )
    );
    screen.getByText("Test Table");
  });

  it("renders Create-button", () => {
    render(
      h(
        Router,
        { history: createMemoryHistory() },
        h(BrowseTable, { ...baseProps })
      )
    );
    expect(screen.getByText("Create").getAttribute("href")).to.equal(
      "/<mountpath>/table/test_table/edit"
    );
  });

  it("renders Link to this page -link", () => {
    render(
      h(
        Router,
        { history: createMemoryHistory() },
        h(BrowseTable, { ...baseProps })
      )
    );
    expect(screen.getByText("Link to this page").getAttribute("href")).to.equal(
      "about:blank" // jsdom issue
    );
  });

  it("renders empty row list", async () => {
    const getTableRowsResponse: ApiResponseGetRows = {
      rows: [],
      totalPages: 1,
      totalResults: 1,
    };
    apiMock.expects("getTableRows").once().resolves(getTableRowsResponse);
    render(
      h(
        Router,
        { history: createMemoryHistory() },
        h(BrowseTable, { ...baseProps, api })
      )
    );
    await waitFor(() => {
      screen.getByText("No rows.");
    });
  });

  describe("wildcard search", () => {
    it("adds wildcardSearch to getRows request", async () => {
      const getTableRowsResponse: ApiResponseGetRows = {
        rows: [],
        totalPages: 1,
        totalResults: 1,
      };
      apiMock
        .expects("getTableRows")
        .once()
        .withExactArgs("test_table", {
          currentPage: 1,
          filters: [],
          orderByColumn: null,
          orderByDirection: "asc",
          perPage: 20,
          wildcardSearch: "",
        })
        .resolves(getTableRowsResponse);
      apiMock
        .expects("getTableRows")
        .once()
        .withExactArgs("test_table", {
          currentPage: 1,
          filters: [],
          orderByColumn: null,
          orderByDirection: "asc",
          perPage: 20,
          wildcardSearch: "foo",
        })
        .resolves(getTableRowsResponse);
      render(
        h(
          Router,
          { history: createMemoryHistory() },
          h(BrowseTable, { ...baseProps, api })
        )
      );
      await waitFor(() =>
        expect(
          document.querySelector('input[placeholder="Search…"]')
        ).to.not.equal(null)
      );
      await userEvent.type(
        document.querySelector('input[placeholder="Search…"]'),
        "foo{enter}",
        { delay: 50 }
      );
    });
  });
});
