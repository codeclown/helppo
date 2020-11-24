import { expect } from "chai";
import express from "express";
import supertest from "supertest";
import formatError from "./formatError";
import router from "./router";
import { HelppoConfig } from "./types";

const baseDriver = {
  getSchema: async () => {
    return {
      tables: [],
    };
  },
  getRows: async () => {
    return {
      rows: [],
      totalPages: 1,
      totalResults: 0,
    };
  },
  saveRow: async () => {
    return {};
  },
  __internalOnClose: () => {
    // do nothing
  },
  deleteRow: async () => {
    // do nothing
  },
  executeRawSqlQuery: async () => {
    return {
      affectedRowsAmount: 0,
      returnedRowsAmount: 0,
      columnNames: [],
      rows: [],
    };
  },
};

const baseConfig: HelppoConfig = {
  driver: baseDriver,
};

const baseOptions = {
  formatError,
};

const dummyAssetRouter = express();
dummyAssetRouter.use((req, res) =>
  res.send(`${req.path} from dummyAssetRouter`)
);

const dummyDriverApi = express();
dummyDriverApi.use((req, res) => res.send(`${req.path} from dummyDriverApi`));

describe("router", () => {
  it("renders index.html with undefined mountpath", async () => {
    const app = express();
    app.use(router(baseConfig, dummyAssetRouter, dummyDriverApi, baseOptions));
    const request = supertest(app);
    const response = await request.get("/");
    expect(response.headers["content-type"]).to.equal(
      "text/html; charset=utf-8"
    );
    expect(response.text).to.contain(
      '<link rel="icon" type="image/png" href="/assets/static/favicon.png">'
    );
    expect(response.text).to.contain(
      '<link rel="stylesheet" href="/assets/client.css">'
    );
    expect(response.text).to.contain('window.mountpath = "";');
    expect(response.text).to.contain(
      '<script src="/assets/client.js"></script>'
    );
  });

  it("renders index.html with correct mountpath", async () => {
    const app = express();
    app.use(
      "/admin",
      router(baseConfig, dummyAssetRouter, dummyDriverApi, baseOptions)
    );
    const request = supertest(app);
    const response = await request.get("/admin");
    expect(response.headers["content-type"]).to.equal(
      "text/html; charset=utf-8"
    );
    expect(response.text).to.contain(
      '<link rel="icon" type="image/png" href="/admin/assets/static/favicon.png">'
    );
    expect(response.text).to.contain(
      '<link rel="stylesheet" href="/admin/assets/client.css">'
    );
    expect(response.text).to.contain('window.mountpath = "/admin";');
    expect(response.text).to.contain(
      '<script src="/admin/assets/client.js"></script>'
    );
  });

  it("renders index.html for any path", async () => {
    const app = express();
    app.use(router(baseConfig, dummyAssetRouter, dummyDriverApi, baseOptions));
    const request = supertest(app);
    const response = await request.get("/foobar123/test");
    expect(response.headers["content-type"]).to.equal(
      "text/html; charset=utf-8"
    );
    expect(response.text).to.contain('window.mountpath = "";');
  });

  it("renders error message if helppo was not mounted", async () => {
    const app = router(
      baseConfig,
      dummyAssetRouter,
      dummyDriverApi,
      baseOptions
    );
    const request = supertest(app);
    const response = await request.get("/foobar123/test");
    expect(response.headers["content-type"]).to.equal(
      "text/html; charset=utf-8"
    );
    expect(response.text).to.contain(
      'errorMessage.textContent = "Please mount helppo to an existing express router first"'
    );
  });

  it("throws if same instance is mounted twice", async () => {
    const instance = router(
      baseConfig,
      dummyAssetRouter,
      dummyDriverApi,
      baseOptions
    );
    const app = express();
    app.use("/admin1", instance);
    expect(() => {
      app.use("/admin2", instance);
    }).to.throw("The same Helppo-instance was mounted multiple times.");
  });

  it("mounts assetRouter at /assets", async () => {
    const app = express();
    app.use(router(baseConfig, dummyAssetRouter, dummyDriverApi, baseOptions));
    const request = supertest(app);
    const response = await request.get("/assets/client.js");
    expect(response.text).to.equal("/client.js from dummyAssetRouter");
  });

  it("mounts driverApi at /api", async () => {
    const app = express();
    app.use(router(baseConfig, dummyAssetRouter, dummyDriverApi, baseOptions));
    const request = supertest(app);
    const response = await request.get("/api/foobar");
    expect(response.text).to.equal("/foobar from dummyDriverApi");
  });

  it("renders error message if config.driver is missing", async () => {
    const app = router(
      { ...baseConfig, driver: null },
      dummyAssetRouter,
      dummyDriverApi,
      baseOptions
    );
    const request = supertest(app);
    const response = await request.get("/foobar123/test");
    expect(response.headers["content-type"]).to.equal(
      "text/html; charset=utf-8"
    );
    expect(response.text).to.contain(
      "errorMessage.textContent = \"The 'driver' config-property is missing\""
    );
  });

  it("renders error message if driver reports connection closed", async () => {
    let callback;
    const driver = {
      ...baseDriver,
      __internalOnClose: (_callback) => {
        callback = _callback;
      },
    };
    const app = router(
      { ...baseConfig, driver },
      dummyAssetRouter,
      dummyDriverApi,
      baseOptions
    );
    callback();
    const request = supertest(app);
    const response = await request.get("/foobar123/test");
    expect(response.headers["content-type"]).to.equal(
      "text/html; charset=utf-8"
    );
    expect(response.text).to.contain(
      'errorMessage.textContent = "Database connection has been interrupted"'
    );
  });

  it("renders error message if driver reports connection closed with message", async () => {
    let callback;
    const driver = {
      ...baseDriver,
      __internalOnClose: (_callback) => {
        callback = _callback;
      },
    };
    const app = router(
      { ...baseConfig, driver },
      dummyAssetRouter,
      dummyDriverApi,
      baseOptions
    );
    callback(new Error("foobar message"));
    const request = supertest(app);
    const response = await request.get("/foobar123/test");
    expect(response.headers["content-type"]).to.equal(
      "text/html; charset=utf-8"
    );
    expect(response.text).to.contain(
      'errorMessage.textContent = "Database connection has been interrupted (error: foobar message)"'
    );
  });

  it("renders error message on unexpected exception", async () => {
    let formatErrorCalledWith;
    const mockedReturnValue = "__mockedReturnValue__";
    const formatError = (...args) => {
      formatErrorCalledWith = args;
      return mockedReturnValue;
    };
    const app = router(baseConfig, dummyAssetRouter, dummyDriverApi, {
      ...baseOptions,
      throwErrorOnPurpose: true,
      formatError,
    });
    const request = supertest(app);
    const response = await request.get("/foobar123/test");
    expect(response.headers["content-type"]).to.equal(
      "text/html; charset=utf-8"
    );
    expect(response.text).to.contain(
      `errorMessage.textContent = "${mockedReturnValue}"`
    );
    expect(formatErrorCalledWith).to.have.length(1);
    expect(formatErrorCalledWith[0]).to.be.an("error");
    expect(formatErrorCalledWith[0].message).to.equal(
      "This error was thrown for testing purposes from router"
    );
  });
});
