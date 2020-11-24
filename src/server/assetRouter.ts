import express, { Router } from "express";
import path from "path";

const assetRouter = (): Router => {
  const clientDir = path.join(__dirname, "../client");
  const app = express();
  app.get("/client.css", (req, res) =>
    res.sendFile(path.join(clientDir, "client.css"))
  );
  app.get("/client.js", (req, res) =>
    res.sendFile(path.join(clientDir, "client.js"))
  );
  app.get("/client.js.map", (req, res) =>
    res.sendFile(path.join(clientDir, "client.js.map"))
  );
  app.use("/static", express.static(path.join(clientDir, "static")));
  return app;
};

export default assetRouter;
