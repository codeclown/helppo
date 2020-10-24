import express from "express";
import indexHtml from "./index.html";

function stripTrailingSlash(mountpath) {
  return mountpath.replace(/\/*$/, "");
}

const router = (config, assetRouter, driverApi) => {
  const app = express();

  let mountpath = null;
  app.on("mount", () => {
    if (mountpath !== null) {
      throw new Error(
        "Warning! The same Helppo-instance was mounted multiple times. Please create a new instance for each mount."
      );
    }
    mountpath = `${stripTrailingSlash(app.mountpath)}`;
  });

  if (config.driver && typeof config.driver.__internalOnClose === "function") {
    let driverHasClosed = false;
    config.driver.__internalOnClose(function onDriverClose(error) {
      driverHasClosed = error || true;
    });
    app.use((req, res, next) => {
      if (driverHasClosed) {
        return res
          .set("content-type", "text/plain")
          .send(
            `Error: database connection has been interrupted${
              driverHasClosed instanceof Error
                ? ` (error: ${driverHasClosed.message})`
                : ""
            }`
          );
      }
      next();
    });
  }

  app.use("/assets", assetRouter);

  app.use("/api", driverApi);

  app.get("*", (req, res) => {
    if (mountpath === null) {
      return res
        .set("content-type", "text/plain")
        .send("Error: please mount helppo to an existing express router first");
    }
    const html = indexHtml(mountpath);
    res.set("content-type", "text/html").send(html);
  });

  return app;
};

export default router;
