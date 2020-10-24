import express from "express";
import supertest from "supertest";
import { expect } from "chai";
import router from "./router";

const dummyAssetRouter = express();
dummyAssetRouter.use((req, res) =>
  res.send(`${req.path} from dummyAssetRouter`)
);

const dummyDriverApi = express();
dummyDriverApi.use((req, res) => res.send(`${req.path} from dummyDriverApi`));

describe("router", () => {
  it("renders index.html with undefined mountpath", async () => {
    const app = express();
    app.use(router({}, dummyAssetRouter, dummyDriverApi));
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
    app.use("/admin", router({}, dummyAssetRouter, dummyDriverApi));
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
    app.use(router({}, dummyAssetRouter, dummyDriverApi));
    const request = supertest(app);
    const response = await request.get("/foobar123/test");
    expect(response.headers["content-type"]).to.equal(
      "text/html; charset=utf-8"
    );
    expect(response.text).to.contain('window.mountpath = "";');
  });

  it("renders error message if helppo was not mounted", async () => {
    const app = router({}, dummyAssetRouter, dummyDriverApi);
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
    const instance = router({}, dummyAssetRouter, dummyDriverApi);
    const app = express();
    app.use("/admin1", instance);
    expect(() => {
      app.use("/admin2", instance);
    }).to.throw("The same Helppo-instance was mounted multiple times.");
  });

  it("mounts assetRouter at /assets", async () => {
    const app = express();
    app.use(router({}, dummyAssetRouter, dummyDriverApi));
    const request = supertest(app);
    const response = await request.get("/assets/client.js");
    expect(response.text).to.equal("/client.js from dummyAssetRouter");
  });

  it("mounts driverApi at /api", async () => {
    const app = express();
    app.use(router({}, dummyAssetRouter, dummyDriverApi));
    const request = supertest(app);
    const response = await request.get("/api/foobar");
    expect(response.text).to.equal("/foobar from dummyDriverApi");
  });

  it("renders error message if driver reports connection closed", async () => {
    let callback;
    const driver = {
      __internalOnClose: (_callback) => {
        callback = _callback;
      },
    };
    const app = router({ driver }, dummyAssetRouter, dummyDriverApi);
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
      __internalOnClose: (_callback) => {
        callback = _callback;
      },
    };
    const app = router({ driver }, dummyAssetRouter, dummyDriverApi);
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
});
