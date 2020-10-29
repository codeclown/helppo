import makeAssetRouter from "./assetRouter";
import * as builtInColumnTypes from "./builtInColumnTypes";
import builtInFilterTypes from "./builtInFilterTypes";
import makeDriverApi from "./driverApi";
import errorHandler from "./errorHandler";
import readLicenseNotice from "./readLicenseNotice";
import makeRouter from "./router";

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
