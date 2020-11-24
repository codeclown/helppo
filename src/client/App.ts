import {
  createElement as h,
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import {
  ApiResponseConfigNotice,
  ApiResponseFilterTypes,
  HelppoSchema,
  HelppoTable,
  RowObject,
} from "../sharedTypes";
import Api from "./Api";
import Images from "./Images";
import Urls from "./Urls";
import UserDefaults from "./UserDefaults";
import BaseColumnType from "./components/BaseColumnType";
import ColumnTypeBoolean from "./components/ColumnTypeBoolean";
import ColumnTypeDate from "./components/ColumnTypeDate";
import ColumnTypeDateTime from "./components/ColumnTypeDateTime";
import ColumnTypeInteger from "./components/ColumnTypeInteger";
import ColumnTypeString from "./components/ColumnTypeString";
import ColumnTypeText from "./components/ColumnTypeText";
import ConfigNotice from "./components/ConfigNotice";
import Container from "./components/Container";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorModal from "./components/ErrorModal";
import Navigation from "./components/Navigation";
import Notifications, {
  NotificationDelays,
  NotificationStyles,
  NotificationOptions,
  Notification,
} from "./components/Notifications";
import PageTitle from "./components/PageTitle";
import BrowseTable from "./pages/BrowseTable";
import EditRow from "./pages/EditRow";
import LicenseNotice from "./pages/LicenseNotice";
import Query from "./pages/Query";
import RecentlyDeleted from "./pages/RecentlyDeleted";
import Schema from "./pages/Schema";
import Welcome from "./pages/Welcome";
import niceifyName from "./utils/niceifyName";

// Exporting prop types

export interface ColumnTypeComponents {
  [key: string]: typeof BaseColumnType;
}
// See columnTypes.js
const builtInColumnTypeComponents: ColumnTypeComponents = {
  ColumnTypeInteger,
  ColumnTypeString,
  ColumnTypeText,
  ColumnTypeDate,
  ColumnTypeDateTime,
  ColumnTypeBoolean,
};

export interface CatchApiError {
  <T>(promise: Promise<T>): Promise<T>;
}

export type RememberDeletedRow = (table: HelppoTable, row: RowObject) => void;

export interface RecentlyDeletedRow {
  tableName: string;
  row: RowObject;
  pending: boolean;
}

export type ShowNotification = (
  message: string,
  options?: Partial<NotificationOptions>
) => void;

// Main component

export interface AppProps {
  Router: ({ children }) => ReactElement;
  api: Api;
  urls: Urls;
  images: Images;
  userDefaults: UserDefaults;
  // Adding internal state handling functions to this object so they
  // can be called in tests
  testingUtilities?: {
    catchApiError?: CatchApiError;
    showNotification?: ShowNotification;
  };
}

const App = ({
  api,
  urls,
  images,
  userDefaults,
  Router,
  testingUtilities,
}: AppProps): ReactElement => {
  enum STATUS {
    LOADING = "LOADING",
    DEFAULT = "DEFAULT",
  }

  const [status, setStatus] = useState<STATUS>(STATUS.LOADING);
  const [configNotice, setConfigNotice] = useState<ApiResponseConfigNotice>(
    null
  );
  const [errorModal, setErrorModal] = useState<Error>(null);
  const [columnTypeComponents, setColumnTypeComponents] = useState<
    ColumnTypeComponents
  >({});
  const [filterTypes, setFilterTypes] = useState<ApiResponseFilterTypes>([]);
  const [schema, setSchema] = useState<HelppoSchema>({
    tables: [],
  });
  const [timeoutIds, setTimeoutIds] = useState<NodeJS.Timeout[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentlyDeletedRows, setRecentlyDeletedRows] = useState<
    RecentlyDeletedRow[]
  >([]);

  // Effects

  useEffect(() => {
    setStatus(STATUS.LOADING);
    Promise.all([
      api.getConfigNotice(),
      api.getSchema(),
      api.getColumnTypes(),
      api.getFilterTypes(),
    ]).then(([configNotice, schema, columnTypes, filterTypes]) => {
      const columnTypeComponents: ColumnTypeComponents = columnTypes.reduce(
        (obj, { type, builtInReactComponentName }) => {
          if (!builtInColumnTypeComponents[builtInReactComponentName]) {
            throw new Error(
              `Component name ${builtInReactComponentName} is not present in builtInColumnTypeComponents`
            );
          }
          obj[type] = builtInColumnTypeComponents[builtInReactComponentName];
          return obj;
        },
        {}
      );
      setConfigNotice(configNotice);
      setSchema(schema);
      setColumnTypeComponents(columnTypeComponents);
      setFilterTypes(filterTypes);
      setStatus(STATUS.DEFAULT);
    });
  }, [STATUS.DEFAULT, STATUS.LOADING, api]);

  useEffect(() => {
    return () =>
      timeoutIds.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
  }, [timeoutIds]);

  // Callbacks

  const catchApiError = useCallback<CatchApiError>((promise) => {
    return promise.catch((error: Error) => {
      setErrorModal(error);
      throw error;
    });
  }, []);
  if (testingUtilities) {
    testingUtilities.catchApiError = catchApiError;
  }

  const hideNotification = useCallback(
    (notification) => {
      setNotifications(notifications.filter((item) => item !== notification));
    },
    [notifications]
  );

  const showNotification = useCallback<ShowNotification>(
    (message, options) => {
      const notification: Notification = {
        id: Math.random(),
        message,
        options: {
          clearAfter: NotificationDelays.QUICK,
          style: NotificationStyles.DEFAULT,
          ...options,
        },
      };
      setNotifications([...notifications, notification]);
      const timeoutId = setTimeout(
        () => hideNotification(notification),
        notification.options.clearAfter
      );
      setTimeoutIds([...timeoutIds, timeoutId]);
    },
    [notifications, timeoutIds, hideNotification]
  );
  if (testingUtilities) {
    testingUtilities.showNotification = showNotification;
  }

  const rememberDeletedRow = useCallback<RememberDeletedRow>(
    (table, row) => {
      setRecentlyDeletedRows(
        [
          ...recentlyDeletedRows,
          { tableName: table.name, row, pending: false },
        ].slice(-10)
      );
    },
    [recentlyDeletedRows]
  );

  const restoreDeletedRow = useCallback(
    async (obj) => {
      const table = schema.tables.find((table) => table.name === obj.tableName);
      setRecentlyDeletedRows(
        recentlyDeletedRows.map((item) => {
          if (item === obj) {
            item.pending = true;
          }
          return item;
        })
      );
      try {
        await catchApiError(api.saveRow(table, null, obj.row));
        showNotification("Row was restored", {
          style: NotificationStyles.DEFAULT,
        });
        setRecentlyDeletedRows(
          recentlyDeletedRows.filter((item) => item !== obj)
        );
      } catch (exception) {
        // eslint-disable-next-line no-console
        console.error(exception);
        setStatus(STATUS.DEFAULT);
        setRecentlyDeletedRows(
          recentlyDeletedRows.map((item) => {
            if (item === obj) {
              item.pending = false;
            }
            return item;
          })
        );
      }
    },
    [
      schema.tables,
      recentlyDeletedRows,
      catchApiError,
      api,
      showNotification,
      STATUS.DEFAULT,
    ]
  );

  // Route callbacks

  const renderWelcome = useCallback(() => {
    return h(
      "div",
      null,
      h(PageTitle, null, "Helppo"),
      h(Welcome, { urls, tables: schema.tables })
    );
  }, [urls, schema]);

  const renderRecentlyDeleted = useCallback(() => {
    return h(RecentlyDeleted, {
      tables: schema.tables,
      rows: recentlyDeletedRows,
      restoreRow: restoreDeletedRow,
    });
  }, [schema, recentlyDeletedRows, restoreDeletedRow]);

  const renderLicenseNotice = useCallback(() => {
    return h(LicenseNotice, {
      api,
      catchApiError,
    });
  }, [api, catchApiError]);

  const renderSchema = useCallback(() => {
    return h(Schema, {
      schema,
    });
  }, [schema]);

  const renderBrowseTable = useCallback(
    (routeProps: RouteComponentProps<{ tableName: string }>) => {
      const { tableName } = routeProps.match.params;
      const table = schema.tables.find((table) => table.name === tableName);
      if (!table) {
        return h(
          Fragment,
          null,
          h(PageTitle, null, "Table not found"),
          h(Container, null, "Table not found…")
        );
      }
      const relations = [].concat(
        ...schema.tables.map((otherTable) => {
          const relatedColumns = otherTable.columns.filter(
            (column) => column.referencesTable === table.name
          );
          return relatedColumns.map((column) => {
            return {
              table: otherTable,
              column,
            };
          });
        })
      );
      return h(BrowseTable, {
        api,
        urls,
        images,
        columnTypeComponents,
        filterTypes,
        catchApiError,
        showNotification,
        rememberDeletedRow,
        table,
        relations,
      });
    },
    [
      schema,
      api,
      urls,
      images,
      columnTypeComponents,
      filterTypes,
      catchApiError,
      showNotification,
      rememberDeletedRow,
    ]
  );

  const renderEditRow = useCallback(
    (routeProps: RouteComponentProps<{ tableName: string }>) => {
      const { tableName } = routeProps.match.params;
      const table = schema.tables.find((table) => table.name === tableName);
      if (!table) {
        return h(Container, null, "Table not found…");
      }
      let rowId = null;
      try {
        rowId = new URLSearchParams(routeProps.location.search).get("rowId");
        if (typeof rowId === "string") {
          rowId = JSON.parse(rowId);
        }
      } catch (exception) {
        // do nothing
      }
      if (!rowId) {
        // redirect
      }
      return h(EditRow, {
        key: routeProps.location.key,
        api,
        urls,
        images,
        columnTypeComponents,
        catchApiError,
        showNotification,
        rememberDeletedRow,
        schema,
        table,
        rowId,
      });
    },
    [
      schema,
      api,
      urls,
      images,
      columnTypeComponents,
      catchApiError,
      showNotification,
      rememberDeletedRow,
    ]
  );

  const renderQuery = useCallback(
    (routeProps: RouteComponentProps) => {
      const urlParams = new URLSearchParams(routeProps.location.search);
      const initialSql = urlParams.get("sql") || "";
      const replaceSqlInUrl = (sql: string) => {
        const url = `${routeProps.location.pathname}?sql=${encodeURIComponent(
          sql
        )}`;
        routeProps.history.replace(url);
      };
      return h(Query, {
        initialSql,
        replaceSqlInUrl,
        api,
        userDefaults,
        catchApiError,
      });
    },
    [api, userDefaults, catchApiError]
  );

  // Return value

  if (status === STATUS.LOADING) {
    return h(Router, null, h(Navigation));
  }

  if (configNotice.suggestedFreshSchema) {
    return h(ConfigNotice, {
      suggestedFreshSchema: configNotice.suggestedFreshSchema,
    });
  }

  return h(
    ErrorBoundary,
    null,
    h(
      Router,
      null,
      h(Navigation, {
        linkGroups: [
          {
            icon: images.navIconTable,
            dropdownTitle: schema.tables.length > 5 ? "Tables" : null,
            links: schema.tables.map((table) => ({
              text: niceifyName(table.name),
              url: urls.tableIndexUrl(table),
            })),
          },
          {
            icon: images.navIconDots,
            dropdownTitle: "Other",
            links: [
              { text: "Query", url: urls.queryUrl() },
              {
                text: "Recently deleted",
                url: urls.recentlyDeletedUrl(),
              },
              {
                text: "Schema",
                url: urls.schemaUrl(),
              },
              { separator: true },
              {
                text: "License notice",
                url: urls.licenseNoticeUrl(),
              },
            ],
          },
        ],
      }),
      h(
        ErrorBoundary,
        null,
        h(
          Switch,
          null,
          h(Route, {
            path: urls.browseTablePattern,
            render: renderBrowseTable,
          }),
          h(Route, {
            path: urls.editRowPattern,
            render: renderEditRow,
          }),
          h(Redirect, {
            from: urls.tableIndexPattern,
            to: urls.browseTablePattern,
          }),
          h(Route, {
            path: urls.queryPattern,
            render: renderQuery,
          }),
          h(Route, {
            path: urls.recentlyDeletedPattern,
            render: renderRecentlyDeleted,
          }),
          h(Route, {
            path: urls.licenseNoticePattern,
            render: renderLicenseNotice,
          }),
          h(Route, {
            path: urls.schemaPattern,
            render: renderSchema,
          }),
          h(Route, { exact: true, path: "/", render: renderWelcome }),
          h(Route, { path: "/", render: () => h(Redirect, { to: "/" }) })
        ),
        h(Notifications, {
          notifications: notifications,
          hideNotification,
        }),
        errorModal &&
          h(ErrorModal, {
            error: errorModal,
            close: () => setErrorModal(null),
          })
      )
    )
  );
};

export default App;
