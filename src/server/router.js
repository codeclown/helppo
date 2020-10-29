import express from "express";
import errorHtml from "./html/errorHtml";
import indexHtml from "./html/indexHtml";

function stripTrailingSlash(mountpath) {
  return mountpath.replace(/\/*$/, "");
}

const router = (config, assetRouter, driverApi) => {
  const app = express();

  // Testing utility
  if (config.throwErrorOnPurpose) {
    app.use((req, res, next) => {
      next(new Error("This error was thrown for testing purposes from router"));
    });
  }

  if (!config.driver) {
    app.use((req, res, next) => {
      next(new Error("The 'driver' config-property is missing"));
    });
  }

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
    const errorMessage = config.errorHandler(error);
    const html = errorHtml(errorMessage);
    return res.set("content-type", "text/html").send(html);
  });

  return app;
};

export default router;
