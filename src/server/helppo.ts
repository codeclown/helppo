import { Router } from "express";
import makeAssetRouter from "./assetRouter";
import columnTypes from "./columnTypes";
import makeDriverApi from "./driverApi";
import filterTypes from "./filterTypes";
import formatError from "./formatError";
import makeRouter from "./router";
import { HelppoConfig } from "./types";

export { default as MysqlDriver } from "./drivers/MysqlDriver";
export { default as PgDriver } from "./drivers/PgDriver";

export default function helppo(config: HelppoConfig): Router {
  const assetRouter = makeAssetRouter();
  const driverApi = makeDriverApi(config, {
    formatError,
    filterTypes,
    columnTypes,
  });
  const router = makeRouter(config, assetRouter, driverApi, {
    formatError,
  });
  return router;
}
