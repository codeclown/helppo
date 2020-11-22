import { render } from "@testing-library/react";
import { expect } from "chai";
import { createElement as h } from "react";
import { StaticRouter as Router } from "react-router-dom";
import { useDom, doneWithDom, Screen } from "../../../test/domSetup";
import { MockApi } from "../Api";
import Images from "../Images";
import Urls from "../Urls";
import BrowseTable, { BrowseTableProps } from "./BrowseTable";

let screen: Screen;

const baseProps: BrowseTableProps = {
  locationKey: "",
  api: new MockApi("<mountpath>"),
  urls: new Urls("<mountpath>"),
  images: new Images("<mountpath>"),
  columnTypeComponents: {},
  filterTypes: [
    {
      key: "equals",
      name: "equals",
      columnTypes: ["integer", "string", "text", "date", "datetime"],
    },
    {
      key: "notEquals",
      name: "does not equal",
      columnTypes: ["integer", "string", "text", "date", "datetime"],
    },
  ],
  catchApiError: async () => {
    return new Promise(() => {
      // never resolve
    });
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
        type: "integer",
      },
      {
        name: "name",
        type: "string",
      },
    ],
  },
  relations: [],
  browseOptions: {
    perPage: 20,
    currentPage: 1,
    filters: [],
    wildcardSearch: "",
    orderByColumn: null,
    orderByDirection: "asc",
  },
  presentationOptions: {
    collapsedColumns: [],
  },
};

describe("BrowseTable", () => {
  beforeEach(() => (screen = useDom()));
  after(() => doneWithDom());

  it("renders table", () => {
    render(h(Router, null, h(BrowseTable, { ...baseProps })));
    screen.getByText("Test Table");
  });

  it("renders Create-button", () => {
    render(h(Router, null, h(BrowseTable, { ...baseProps })));
    expect(screen.getByText("Create").getAttribute("href")).to.equal(
      "/<mountpath>/table/test_table/edit"
    );
  });

  it("renders Link to this page -link", () => {
    render(h(Router, null, h(BrowseTable, { ...baseProps })));
    expect(screen.getByText("Link to this page").getAttribute("href")).to.equal(
      "about:blank" // jsdom issue
    );
  });
});
