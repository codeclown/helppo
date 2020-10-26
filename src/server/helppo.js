import makeAssetRouter from "./assetRouter";
import makeDriverApi from "./driverApi";
import makeRouter from "./router";
import * as builtInColumnTypes from "./builtInColumnTypes";
import builtInFilterTypes from "./builtInFilterTypes";
import readLicenseNotice from "./readLicenseNotice";
import errorHandler from "./errorHandler";

export { default as MysqlDriver } from "./drivers/MysqlDriver";

export { default as PgDriver } from "./drivers/PgDriver";

export default function helppo(config) {
  const licenseNotice = readLicenseNotice();
  config = Object.assign({}, config, {
    licenseNotice,
    errorHandler,
    // At the moment custom column types are not supported
    columnTypes: builtInColumnTypes,
    filterTypes: builtInFilterTypes,
  });
  const assetRouter = makeAssetRouter();
  const driverApi = makeDriverApi(config);
  const router = makeRouter(config, assetRouter, driverApi);
  return router;
}
