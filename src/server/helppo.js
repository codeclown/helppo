import makeAssetRouter from "./assetRouter";
import makeDriverApi from "./driverApi";
import makeRouter from "./router";
import builtInColumnTypes from "./builtInColumnTypes";
import builtInFilterTypes from "./builtInFilterTypes";
import readLicenseNotice from "./readLicenseNotice";
import MysqlDriver from "./drivers/MysqlDriver";
import PgDriver from "./drivers/PgDriver";

const helppo = (config) => {
  const licenseNotice = readLicenseNotice();
  config = Object.assign({}, config, {
    licenseNotice,
    // At the moment custom column types are not supported
    columnTypes: builtInColumnTypes,
    filterTypes: builtInFilterTypes,
  });
  const assetRouter = makeAssetRouter();
  const driverApi = makeDriverApi(config);
  const router = makeRouter(config, assetRouter, driverApi);
  return router;
};

helppo.drivers = {};
helppo.drivers.MysqlDriver = MysqlDriver;
helppo.drivers.PgDriver = PgDriver;

export default helppo;
