import { render, waitFor, screen } from "@testing-library/react";
import { expect } from "chai";
import { History, createMemoryHistory } from "history";
import { createElement as h, ReactElement } from "react";
import { Router as ReactRouter } from "react-router";
import sinon from "sinon";
import {
  ApiResponseColumnTypes,
  ApiResponseConfigNotice,
  ApiResponseFilterTypes,
  ApiResponseGetRows,
  ApiResponseLicenseNotice,
  ApiResponseSchema,
} from "../sharedTypes";
import Api, { MockApi } from "./Api";
import App, { AppProps, CatchApiError, ShowNotification } from "./App";
import Images from "./Images";
import Urls from "./Urls";
import UserDefaults from "./UserDefaults";

const routerWithHistory = (history: History) => ({ children }): ReactElement =>
  h(ReactRouter, { history }, children);

const baseProps: AppProps = {
  Router: routerWithHistory(createMemoryHistory()),
  api: new MockApi("/<mountpath>"),
  urls: new Urls("/<mountpath>"),
  images: new Images("/<mountpath>"),
  userDefaults: new UserDefaults(),
};

describe("App", () => {
  it("renders loading state", () => {
    const api = new MockApi("/<mountpath>");
    render(h(App, { ...baseProps, api }));
    expect(document.body.outerHTML).to.equal(
      '<body><div><div class="Navigation"></div></div></body>'
    );
  });

  it("renders suggested schema", async () => {
    const api = new MockApi("/<mountpath>");
    const apiMock = sinon.mock(api);
    const getConfigNoticeResponse: ApiResponseConfigNotice = {
      suggestedFreshSchema: {
        tables: [{ name: "foobar", columns: [] }],
      },
    };
    const getSchemaResponse: ApiResponseSchema = {
      tables: [],
    };
    const getColumnTypesResponse: ApiResponseColumnTypes = [];
    const getFilterTypesResponse: ApiResponseFilterTypes = [];
    apiMock.expects("getConfigNotice").once().resolves(getConfigNoticeResponse);
    apiMock.expects("getSchema").once().resolves(getSchemaResponse);
    apiMock.expects("getColumnTypes").once().resolves(getColumnTypesResponse);
    apiMock.expects("getFilterTypes").once().resolves(getFilterTypesResponse);
    render(h(App, { ...baseProps, api }));
    apiMock.verify();
    await waitFor(() => {
      screen.getByText("Welcome to Helppo!");
    });
  });

  describe("routes", () => {
    let api: Api;
    let apiMock: sinon.SinonMock;

    beforeEach(() => {
      api = new MockApi("/<mountpath>");
      apiMock = sinon.mock(api);
      const getConfigNoticeResponse: ApiResponseConfigNotice = {
        suggestedFreshSchema: null,
      };
      const getSchemaResponse: ApiResponseSchema = {
        tables: [
          { name: "table_1", columns: [] },
          { name: "table_2", columns: [] },
          { name: "table_3", columns: [] },
        ],
      };
      const getColumnTypesResponse: ApiResponseColumnTypes = [];
      const getFilterTypesResponse: ApiResponseFilterTypes = [];
      apiMock
        .expects("getConfigNotice")
        .once()
        .resolves(getConfigNoticeResponse);
      apiMock.expects("getSchema").once().resolves(getSchemaResponse);
      apiMock.expects("getColumnTypes").once().resolves(getColumnTypesResponse);
      apiMock.expects("getFilterTypes").once().resolves(getFilterTypesResponse);
    });

    afterEach(() => {
      apiMock.verify();
    });

    it("renders /", async () => {
      const expectTableLink = (text: string, url: string): void => {
        const link = document.querySelector(
          `.BlockLinkList__item[href="${url}"]`
        );
        expect(link).to.not.equal(null);
        expect(link.textContent).to.equal(text);
      };
      render(h(App, { ...baseProps, api }));
      await waitFor(() => {
        screen.getByText("Welcome!");
      });

      expectTableLink("Table 1", "/<mountpath>/table/table_1");
      expectTableLink("Table 2", "/<mountpath>/table/table_2");
      expectTableLink("Table 3", "/<mountpath>/table/table_3");
    });

    it("renders links to other pages", async () => {
      const expectLink = (text: string, url: string): void => {
        const link = document.querySelector(`a[href="${url}"]`);
        expect(link).to.not.equal(null);
        expect(link.textContent).to.equal(text);
      };
      render(h(App, { ...baseProps, api }));
      await waitFor(() => {
        screen.getByText("Welcome!");
      });

      expectLink("Query", "/<mountpath>/query");
      expectLink("Recently deleted", "/<mountpath>/recently-deleted");
      expectLink("Schema", "/<mountpath>/schema");
      expectLink("License notice", "/<mountpath>/license-notice");
    });

    it("renders /license-notice", async () => {
      const getLicenseNoticeResponse: ApiResponseLicenseNotice =
        "<license text>";
      apiMock
        .expects("getLicenseNotice")
        .once()
        .resolves(getLicenseNoticeResponse);
      const history = createMemoryHistory();
      history.push("/<mountpath>/license-notice");
      render(
        h(App, {
          ...baseProps,
          api,
          Router: routerWithHistory(history),
        })
      );
      await waitFor(() => {
        screen.getByText("<license text>");
      });
    });

    it("renders /recently-deleted", async () => {
      const history = createMemoryHistory();
      history.push("/<mountpath>/recently-deleted");
      render(
        h(App, {
          ...baseProps,
          api,
          Router: routerWithHistory(history),
        })
      );
      await waitFor(() => {
        screen.getByText(/This page lists the 10 last rows you deleted/);
      });
    });

    it("renders /query", async () => {
      const history = createMemoryHistory();
      history.push("/<mountpath>/query");
      render(
        h(App, {
          ...baseProps,
          api,
          Router: routerWithHistory(history),
        })
      );
      await waitFor(() => {
        screen.getByText("Run query");
      });
    });

    it("renders /schema", async () => {
      const history = createMemoryHistory();
      history.push("/<mountpath>/schema");
      render(
        h(App, {
          ...baseProps,
          api,
          Router: routerWithHistory(history),
        })
      );
      await waitFor(() => {
        screen.getByText("This is the currently active schema configuration:");
      });
    });

    it("renders /table/:tableName", async () => {
      const history = createMemoryHistory();
      history.push("/<mountpath>/table/table_1");
      render(
        h(App, {
          ...baseProps,
          api,
          Router: routerWithHistory(history),
        })
      );
      await waitFor(() => {
        screen.getByText("+ Add filter");
      });
    });

    it("renders /table/:tableName/browse", async () => {
      const history = createMemoryHistory();
      history.push("/<mountpath>/table/table_1/browse");
      render(
        h(App, {
          ...baseProps,
          api,
          Router: routerWithHistory(history),
        })
      );
      await waitFor(() => {
        screen.getByText("+ Add filter");
      });
    });

    it("renders /table/:tableName/edit", async () => {
      const history = createMemoryHistory();
      history.push("/<mountpath>/table/table_1/edit");
      render(
        h(App, {
          ...baseProps,
          api,
          Router: routerWithHistory(history),
        })
      );
      await waitFor(() => {
        screen.getByText(/New row in/);
      });
    });

    it("renders /table/:tableName/edit?rowId=123", async () => {
      const getTableRowsResponse: ApiResponseGetRows = {
        rows: [
          {
            id: 123,
          },
        ],
        totalPages: 1,
        totalResults: 1,
      };
      apiMock.expects("getTableRows").once().resolves(getTableRowsResponse);
      const history = createMemoryHistory();
      history.push("/<mountpath>/table/table_1/edit?rowId=123");
      render(
        h(App, {
          ...baseProps,
          api,
          Router: routerWithHistory(history),
        })
      );
      await waitFor(() => {
        screen.getByText(/Edit row “123” row in/);
      });
    });

    it("renders notifications", async () => {
      const testingUtilities: { showNotification?: ShowNotification } = {};
      render(
        h(App, {
          ...baseProps,
          api,
          testingUtilities,
        })
      );
      testingUtilities.showNotification("Foobar notification!");
      await waitFor(() => {
        screen.getByText("Foobar notification!");
      });
    });

    it("renders error modal", async () => {
      // catchApiError seems to cause UnhandledPromiseRejectionWarning even
      // though the failure is handled. Suppress that logging for this test.
      process.once("unhandledRejection", () => {
        // do nothing
      });
      const testingUtilities: { catchApiError?: CatchApiError } = {};
      render(
        h(App, {
          ...baseProps,
          api,
          testingUtilities,
        })
      );
      testingUtilities.catchApiError(
        Promise.reject(new Error("Mocked rejection"))
      );
      await waitFor(() => {
        screen.getByText("An unexpected error occurred:");
      });
      screen.getByText("Error: Mocked rejection");
    });

    it("redirects 404 to /", async () => {
      const history = createMemoryHistory();
      history.push("/<mountpath>/foobar-123");
      render(
        h(App, {
          ...baseProps,
          api,
          Router: routerWithHistory(history),
        })
      );
      await waitFor(() => {
        screen.getByText("Welcome!");
      });
    });
  });
});
