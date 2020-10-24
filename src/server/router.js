import express from "express";
import indexHtml from "./html/indexHtml";
import errorHtml from "./html/errorHtml";

function stripTrailingSlash(mountpath) {
  return mountpath.replace(/\/*$/, "");
}

const router = (config, assetRouter, driverApi) => {
  const app = express();

  app.use("/assets", assetRouter);

  app.use("/api", driverApi);

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
        return next(
          new Error(
            `Database connection has been interrupted${
              driverHasClosed instanceof Error
                ? ` (error: ${driverHasClosed.message})`
                : ""
            }`
          )
        );
      }
      next();
    });
  }

  app.get("*", (req, res, next) => {
    if (mountpath === null) {
      return next(
        new Error("Please mount helppo to an existing express router first")
      );
    }
    const html = indexHtml(mountpath);
    res.set("content-type", "text/html").send(html);
  });

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    const html = errorHtml(error);
    return res.set("content-type", "text/html").send(html);
  });

  return app;
};

export default router;
