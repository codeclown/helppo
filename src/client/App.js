import { Component, createElement as h, Fragment } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
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
import InlineLink from "./components/InlineLink";
import Navigation from "./components/Navigation";
import Notifications, {
  NotificationDelays,
  NotificationStyles,
} from "./components/Notifications";
import PageTitle from "./components/PageTitle";
import BrowseTable from "./pages/BrowseTable";
import EditRow from "./pages/EditRow";
import LicenseNotice from "./pages/LicenseNotice";
import Query from "./pages/Query";
import RecentlyDeleted from "./pages/RecentlyDeleted";
import Schema from "./pages/Schema";
import Welcome from "./pages/Welcome";
import doubleQuotes from "./utils/doubleQuotes";
import niceifyName from "./utils/niceifyName";

const STATUS = {
  LOADING: "LOADING",
  DEFAULT: "DEFAULT",
};

// See columnTypes.js
const builtInColumnTypeComponents = {
  ColumnTypeInteger,
  ColumnTypeString,
  ColumnTypeText,
  ColumnTypeDate,
  ColumnTypeDateTime,
  ColumnTypeBoolean,
};

class App extends Component {
  constructor(props) {
    super();

    this.state = {
      status: STATUS.LOADING,
      mountpath: props.mountpath,
      configNotice: null,
      errorModal: null,
      columnTypeComponents: {},
      filterTypes: [],
      schema: {
        tables: [],
      },
      notifications: [],
      recentlyDeletedRows: [],
    };

    this.catchApiError = this.catchApiError.bind(this);
    this.showNotification = this.showNotification.bind(this);
    this.hideNotification = this.hideNotification.bind(this);
    this.rememberDeletedRow = this.rememberDeletedRow.bind(this);
    this.restoreDeletedRow = this.restoreDeletedRow.bind(this);
    this.renderWelcome = this.renderWelcome.bind(this);
    this.renderBrowseTable = this.renderBrowseTable.bind(this);
    this.renderEditRow = this.renderEditRow.bind(this);
    this.renderQuery = this.renderQuery.bind(this);
    this.renderRecentlyDeleted = this.renderRecentlyDeleted.bind(this);
    this.renderLicenseNotice = this.renderLicenseNotice.bind(this);
    this.renderSchema = this.renderSchema.bind(this);
  }

  async componentDidMount() {
    this.setState({ status: STATUS.LOADING });

    const [configNotice, schema, columnTypes, filterTypes] = await Promise.all([
      this.props.api.getConfigNotice(),
      this.props.api.getSchema(),
      this.props.api.getColumnTypes(),
      this.props.api.getFilterTypes(),
    ]);

    const columnTypeComponents = columnTypes.reduce(
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

    this.setState({
      configNotice,
      schema,
      columnTypeComponents,
      filterTypes,
      status: STATUS.DEFAULT,
    });
  }

  catchApiError(promise) {
    return promise.catch((error) => {
      this.setState({
        errorModal: error,
      });
      throw error;
    });
  }

  showNotification(message, options) {
    options = Object.assign(
      {
        clearAfter: NotificationDelays.QUICK,
        style: NotificationStyles.DEFAULT,
      },
      options
    );
    const notification = {
      id: Math.random(),
      message,
      options,
    };
    this.setState((state) => ({
      notifications: [].concat(state.notifications, [notification]),
    }));
    setTimeout(() => this.hideNotification(notification), options.clearAfter);
  }

  hideNotification(notification) {
    this.setState({
      notifications: this.state.notifications.filter(
        (item) => item !== notification
      ),
    });
  }

  rememberDeletedRow(table, row) {
    this.setState({
      recentlyDeletedRows: []
        .concat(this.state.recentlyDeletedRows, [
          { tableName: table.name, row, pending: false },
        ])
        .slice(-10),
    });
  }

  async restoreDeletedRow(obj) {
    const table = this.state.schema.tables.find(
      (table) => table.name === obj.tableName
    );
    this.setState({
      recentlyDeletedRows: this.state.recentlyDeletedRows.map((item) => {
        if (item === obj) {
          item.pending = true;
        }
        return item;
      }),
    });
    try {
      await this.catchApiError(this.props.api.saveRow(table, null, obj.row));
      this.showNotification("Row was restored", {
        style: NotificationStyles.DEFAULT,
      });
      this.setState({
        recentlyDeletedRows: this.state.recentlyDeletedRows.filter(
          (item) => item !== obj
        ),
      });
    } catch (exception) {
      // eslint-disable-next-line no-console
      console.error(exception);
      this.setState({ status: STATUS.DEFAULT });
      this.setState({
        recentlyDeletedRows: this.state.recentlyDeletedRows.map((item) => {
          if (item === obj) {
            item.pending = false;
          }
          return item;
        }),
      });
    }
  }

  renderWelcome() {
    return h(
      "div",
      null,
      h(PageTitle, null, "Helppo"),
      h(Welcome, { urls: this.props.urls, tables: this.state.schema.tables })
    );
  }

  renderTableNotFound(tableName) {
    return h(
      Fragment,
      null,
      h(PageTitle, null, `Table ${doubleQuotes(tableName)} not found`),
      h(
        Container,
        null,
        `Table ${doubleQuotes(tableName)} not found. `,
        h(InlineLink, { to: this.props.urls.homeUrl() }, "Go to table list.")
      )
    );
  }

  renderBrowseTable(routeProps) {
    const { tableName } = routeProps.match.params;
    const table = this.state.schema.tables.find(
      (table) => table.name === tableName
    );
    if (!table) {
      return this.renderTableNotFound(tableName);
    }
    const relations = [].concat(
      ...this.state.schema.tables.map((otherTable) => {
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
    const searchParams = new URLSearchParams(routeProps.location.search);
    let browseOptions = {};
    try {
      browseOptions = JSON.parse(searchParams.get("browseOptions"));
    } catch (exception) {
      // ...
    }
    browseOptions = Object.assign(
      {
        perPage: 20,
        currentPage: 1,
        filters: [],
        wildcardSearch: "",
      },
      browseOptions
    );
    let presentationOptions = {};
    try {
      presentationOptions = JSON.parse(searchParams.get("presentationOptions"));
    } catch (exception) {
      // ...
    }
    presentationOptions = Object.assign(
      { collapsedColumns: [] },
      presentationOptions
    );
    return h(BrowseTable, {
      locationKey: routeProps.location.key,
      api: this.props.api,
      urls: this.props.urls,
      images: this.props.images,
      columnTypeComponents: this.state.columnTypeComponents,
      filterTypes: this.state.filterTypes,
      catchApiError: this.catchApiError,
      showNotification: this.showNotification,
      rememberDeletedRow: this.rememberDeletedRow,
      table,
      relations,
      browseOptions,
      presentationOptions,
    });
  }

  renderEditRow(routeProps) {
    const { tableName } = routeProps.match.params;
    const table = this.state.schema.tables.find(
      (table) => table.name === tableName
    );
    if (!table) {
      return this.renderTableNotFound(tableName);
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
      return h(Redirect, { to: this.props.urls.tableIndexUrl(table) });
    }
    return h(EditRow, {
      key: routeProps.location.key,
      api: this.props.api,
      urls: this.props.urls,
      images: this.props.images,
      columnTypeComponents: this.state.columnTypeComponents,
      catchApiError: this.catchApiError,
      showNotification: this.showNotification,
      rememberDeletedRow: this.rememberDeletedRow,
      schema: this.state.schema,
      table,
      rowId,
    });
  }

  renderQuery(routeProps) {
    const urlParams = new URLSearchParams(routeProps.location.search);
    const initialSql = urlParams.get("sql") || "";
    const replaceSqlInUrl = (sql) => {
      const url = `${routeProps.location.pathname}?sql=${encodeURIComponent(
        sql
      )}`;
      routeProps.history.replace(url);
    };
    return h(Query, {
      initialSql,
      replaceSqlInUrl,
      api: this.props.api,
      userDefaults: this.props.userDefaults,
      catchApiError: this.catchApiError,
    });
  }

  renderRecentlyDeleted() {
    return h(RecentlyDeleted, {
      tables: this.state.schema.tables,
      rows: this.state.recentlyDeletedRows,
      restoreRow: this.restoreDeletedRow,
    });
  }

  renderLicenseNotice() {
    return h(LicenseNotice, {
      api: this.props.api,
      catchApiError: this.catchApiError,
    });
  }

  renderSchema() {
    return h(Schema, {
      schema: this.state.schema,
    });
  }

  render() {
    const Router = this.props.Router;
    const routerProps = this.props.routerProps || null;

    if (this.state.status === STATUS.LOADING) {
      return h(Router, routerProps, h(Navigation));
    }

    if (this.state.configNotice) {
      return h(ConfigNotice, {
        ...this.state.configNotice,
      });
    }

    return h(
      ErrorBoundary,
      null,
      h(
        Router,
        routerProps,
        h(Navigation, {
          linkGroups: [
            {
              icon: this.props.images.navIconTable,
              dropdownTitle:
                this.state.schema.tables.length > 5 ? "Tables" : null,
              links: this.state.schema.tables.map((table) => ({
                text: niceifyName(table.name),
                url: this.props.urls.tableIndexUrl(table),
              })),
            },
            {
              icon: this.props.images.navIconDots,
              dropdownTitle: "Other",
              links: [
                { text: "Query", url: this.props.urls.queryUrl() },
                {
                  text: "Recently deleted",
                  url: this.props.urls.recentlyDeletedUrl(),
                },
                {
                  text: "Schema",
                  url: this.props.urls.schemaUrl(),
                },
                { separator: true },
                {
                  text: "License notice",
                  url: this.props.urls.licenseNoticeUrl(),
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
              path: this.props.urls.browseTablePattern,
              render: this.renderBrowseTable,
            }),
            h(Route, {
              path: this.props.urls.editRowPattern,
              render: this.renderEditRow,
            }),
            h(Redirect, {
              from: this.props.urls.tableIndexPattern,
              to: this.props.urls.browseTablePattern,
            }),
            h(Route, {
              path: this.props.urls.queryPattern,
              render: this.renderQuery,
            }),
            h(Route, {
              path: this.props.urls.recentlyDeletedPattern,
              render: this.renderRecentlyDeleted,
            }),
            h(Route, {
              path: this.props.urls.licenseNoticePattern,
              render: this.renderLicenseNotice,
            }),
            h(Route, {
              path: this.props.urls.schemaPattern,
              render: this.renderSchema,
            }),
            h(Route, {
              exact: true,
              path: this.props.urls.homePattern,
              render: this.renderWelcome,
            }),
            h(Route, {
              path: "/",
              render: () => h(Redirect, { to: this.props.urls.homeUrl() }),
            })
          ),
          h(Notifications, {
            notifications: this.state.notifications,
            hideNotification: this.hideNotification,
          }),
          this.state.errorModal &&
            h(ErrorModal, {
              error: this.state.errorModal,
              close: () =>
                this.setState({
                  errorModal: null,
                }),
            })
        )
      )
    );
  }
}

export default App;
