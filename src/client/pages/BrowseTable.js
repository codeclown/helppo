import { Component, createElement as h, Fragment } from "react";
import { Redirect } from "react-router-dom";
import Button, { ButtonStyles } from "../components/Button";
import Code from "../components/Code";
import Container from "../components/Container";
import CopyToClipboardButton from "../components/CopyToClipboardButton";
import Filters from "../components/Filters";
import LayoutColumns from "../components/LayoutColumns";
import Table, { TableLink } from "../components/Table";
import Select from "../components/Select";
import HeadingBlock from "../components/HeadingBlock";
import PageTitle from "../components/PageTitle";
import Pagination from "../components/Pagination";
import TableCellTools from "../components/TableCellTools";
import TotalResults from "../components/TotalResults";
import {
  NotificationStyles,
  NotificationDelays,
} from "../components/Notifications";
import limitText from "../utils/limitText";
import niceifyName from "../utils/niceifyName";
import range from "../utils/range";
import naiveCsvStringify from "../utils/naiveCsvStringify";

class BrowseTable extends Component {
  constructor(props) {
    super();

    this.state = {
      rows: null,
      browseOptions: Object.assign(
        {
          perPage: 10,
          currentPage: 1,
          filters: [],
        },
        props.browseOptions
      ),
      updatedBrowseOptions: null,
      presentationOptions: Object.assign(
        {
          collapsedColumns: [],
        },
        props.presentationOptions
      ),
      selectedRows: [],
      updatedPresentationOptions: null,
      totalPages: 1,
      totalResults: null,
      // TODO now only possible to add "equals" filter... should show a dropdown with all the column-specific options
      columnTypesForAddAsFilter: props.filterTypes.find(
        (filterType) => filterType.key === "equals"
      ).columnTypes,
    };

    this.updateBrowseOptions = this.updateBrowseOptions.bind(this);
    this.getRows = this.getRows.bind(this);
    this.deleteSelectedRows = this.deleteSelectedRows.bind(this);
    this.renderColumnTitle = this.renderColumnTitle.bind(this);
    this.renderValueCell = this.renderValueCell.bind(this);
    this.renderRelatedTableLinks = this.renderRelatedTableLinks.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentDidMount() {
    this.getRows();
  }

  updateBrowseOptions(browseOptions) {
    this.setState({
      updatedBrowseOptions: Object.assign(
        {},
        this.state.browseOptions,
        browseOptions
      ),
    });
  }

  updatePresentationOptions(presentationOptions) {
    this.setState({
      updatedPresentationOptions: Object.assign(
        {},
        this.state.presentationOptions,
        presentationOptions
      ),
    });
  }

  async deleteSelectedRows() {
    // Safe guard limiting only to a subset of visible rows, as it should be,
    // just in case there has been a state mess-up
    const visibleRowIds = this.state.rows.map(
      (row) => row[this.props.table.primaryKey]
    );
    const rowIdsToDelete = this.state.selectedRows.filter((rowId) =>
      visibleRowIds.includes(rowId)
    );
    if (!rowIdsToDelete.length) {
      return;
    }
    const successfullyDeleted = [];
    await Promise.all(
      rowIdsToDelete.map(async (rowId) => {
        const row = this.state.rows.find(
          (row) => row[this.props.table.primaryKey] === rowId
        );
        try {
          await this.props.api.deleteRow(this.props.table, rowId);
          successfullyDeleted.push(rowId);
          this.props.rememberDeletedRow(this.props.table, row);
        } catch (error) {
          console.error(error);
          this.props.showNotification(`Deleting row ${rowId} failed`, {
            style: NotificationStyles.DANGER,
            clearAfter: NotificationDelays.SLOW,
          });
        }
      })
    );
    if (successfullyDeleted.length) {
      this.props.showNotification(
        `Row${
          successfullyDeleted.length === 1 ? "" : "s"
        } ${successfullyDeleted.join(", ")} ${
          successfullyDeleted.length === 1 ? "was" : "were"
        } deleted`
      );
    }
    await this.getRows();
    const stillVisibleRowIds = this.state.rows.map(
      (row) => row[this.props.table.primaryKey]
    );
    const selectedRowIdsToRemain = this.state.selectedRows.filter((rowId) =>
      stillVisibleRowIds.includes(rowId)
    );
    this.setState(() => ({
      selectedRows: selectedRowIdsToRemain,
    }));
  }

  async getRows() {
    const {
      rows,
      totalPages,
      totalResults,
      browseOptions,
    } = await this.props.catchApiError(
      this.props.api.getTableRows(this.props.table, this.state.browseOptions)
    );
    if (browseOptions === this.state.browseOptions) {
      this.setState({ rows, totalPages, totalResults });
    }
  }

  renderColumnTitle(column) {
    const niceName = niceifyName(column.name);
    const isPrimaryKey = this.props.table.primaryKey === column.name;

    if (this.state.presentationOptions.collapsedColumns.includes(column.name)) {
      return h(
        Fragment,
        null,
        h(
          "span",
          {
            title: niceName.length > 2 ? niceName : "",
          },
          limitText(niceName, 2)
        ),
        h(TableCellTools, {
          images: this.props.images,
          isPrimaryKey,
          uncollapseColumnUrl: this.props.urls.browseTableUrl(
            this.props.table.name,
            this.state.browseOptions,
            {
              collapsedColumns: this.state.presentationOptions.collapsedColumns.filter(
                (name) => name !== column.name
              ),
            }
          ),
        })
      );
    }

    const { orderByColumn, orderByDirection } = this.state.browseOptions;
    const sorted = orderByColumn === column.name;
    const sortedAsc = sorted && orderByDirection === "asc";
    const sortedDesc = sorted && orderByDirection === "desc";

    return h(
      Fragment,
      null,
      h("span", null, niceName),
      h(TableCellTools, {
        images: this.props.images,
        isPrimaryKey,
        columnComment: column.comment,
        collapseColumnUrl: this.props.urls.browseTableUrl(
          this.props.table.name,
          this.state.browseOptions,
          {
            collapsedColumns: [
              ...this.state.presentationOptions.collapsedColumns,
              column.name,
            ],
          }
        ),
        sortedAsc,
        sortAscUrl: sortedAsc
          ? null
          : this.props.urls.browseTableUrl(
              this.props.table.name,
              {
                ...this.state.browseOptions,
                orderByColumn: column.name,
                orderByDirection: "asc",
              },
              this.state.presentationOptions
            ),
        sortedDesc,
        sortDescUrl: sortedDesc
          ? null
          : this.props.urls.browseTableUrl(
              this.props.table.name,
              {
                ...this.state.browseOptions,
                orderByColumn: column.name,
                orderByDirection: "desc",
              },
              this.state.presentationOptions
            ),
      })
    );
  }

  renderColumnValue(column, value, ColumnTypeComponent) {
    if (column.secret) {
      return h("span", { title: "Value is hidden" }, "*****");
    }

    if (value === null) {
      return h(Code, null, "NULL");
    }

    if (column.name === this.props.table.primaryKey) {
      return h(
        TableLink,
        { to: this.props.urls.editRowUrl(this.props.table, value) },
        ColumnTypeComponent.valueAsText(value)
      );
    }

    if (column.referencesColumn) {
      return h(
        TableLink,
        {
          to: this.props.urls.browseTableUrl(
            column.referencesTable,
            {
              filters: [
                {
                  type: "equals",
                  columnName: column.referencesColumn,
                  value,
                },
              ],
            },
            {}
          ),
        },
        ColumnTypeComponent.valueAsText(value)
      );
    }

    return h(ColumnTypeComponent, {
      editable: false,
      value,
      images: this.props.images,
    });
  }

  renderValueCell(row, column) {
    const value = row[column.name];
    const ColumnTypeComponent = this.props.columnTypeComponents[column.type];

    if (this.state.presentationOptions.collapsedColumns.includes(column.name)) {
      const string =
        value === null ? "" : ColumnTypeComponent.valueAsText(value);
      return h(
        "span",
        {
          title: limitText(string, 200),
        },
        "…"
      );
    }

    return h(
      Fragment,
      null,
      this.renderColumnValue(column, value, ColumnTypeComponent),
      h(TableCellTools, {
        images: this.props.images,
        addAsFilterUrl:
          value !== null &&
          this.state.columnTypesForAddAsFilter.includes(column.type) &&
          this.props.urls.browseTableUrl(
            this.props.table.name,
            {
              filters: [
                ...this.state.browseOptions.filters,
                { type: "equals", columnName: column.name, value },
              ],
            },
            this.state.presentationOptions
          ),
      })
    );
  }

  renderRelatedTableLinks(row) {
    if (this.props.relations.length === 0) {
      return "–";
    }
    return this.props.relations.map((relation) => {
      const filters = [
        {
          type: "equals",
          columnName: relation.column.name,
          value: row[relation.column.referencesColumn],
        },
      ];
      return h(
        TableLink,
        {
          key: relation.table.name,
          to: this.props.urls.browseTableUrl(relation.table.name, { filters }),
        },
        niceifyName(relation.table.name)
      );
    });
  }

  renderRow(row) {
    const primaryKey =
      this.props.table.primaryKey && row[this.props.table.primaryKey];
    return [
      this.props.table.primaryKey &&
        h("input", {
          type: "checkbox",
          className: "Table__checkbox",
          checked: this.state.selectedRows.includes(primaryKey),
          onChange: (event) => {
            this.setState({
              selectedRows: event.target.checked
                ? [...this.state.selectedRows, primaryKey]
                : this.state.selectedRows.filter((item) => item !== primaryKey),
            });
          },
        }),
      ...this.props.table.columns.map((column) =>
        this.renderValueCell(row, column)
      ),
      this.renderRelatedTableLinks(row),
    ];
  }

  render() {
    if (this.state.updatedBrowseOptions) {
      return h(Redirect, {
        to: this.props.urls.browseTableUrl(
          this.props.table.name,
          this.state.updatedBrowseOptions,
          this.state.presentationOptions
        ),
      });
    }

    if (this.state.updatedPresentationOptions) {
      return h(Redirect, {
        to: this.props.urls.browseTableUrl(
          this.props.table.name,
          this.state.browseOptions,
          this.state.updatedPresentationOptions
        ),
      });
    }

    const title = niceifyName(this.props.table.name);

    return h(
      "div",
      null,
      h(PageTitle, null, title),
      h(HeadingBlock, { level: 2 }, title),
      h(
        Container,
        null,
        h(
          Button,
          {
            style: ButtonStyles.SUCCESS,
            to: this.props.urls.editRowUrl(this.props.table),
          },
          "Create"
        ),
        this.state.selectedRows.length !== 0 &&
          h(
            Fragment,
            null,
            h(
              Button,
              {
                style: ButtonStyles.DANGER,
                onClick: this.deleteSelectedRows,
              },
              `Delete ${this.state.selectedRows.length} rows`
            ),
            h(
              CopyToClipboardButton,
              {
                style: ButtonStyles.GHOST,
                onCopy: () => {
                  const column = this.props.table.columns.find(
                    (column) => column.name === this.props.table.primaryKey
                  );
                  const ColumnTypeComponent = this.props.columnTypeComponents[
                    column.type
                  ];
                  return this.state.rows
                    .map((row) => {
                      const value = row[this.props.table.primaryKey];
                      return value === null
                        ? ""
                        : ColumnTypeComponent.valueAsText(value).replace(
                            /\n/g,
                            "\\n"
                          );
                    })
                    .join("\n");
                },
              },
              `Copy ${niceifyName(this.props.table.primaryKey)} values`
            ),
            h(
              CopyToClipboardButton,
              {
                style: ButtonStyles.GHOST,
                onCopy: () => {
                  return naiveCsvStringify([
                    this.props.table.columns.map((column) => column.name),
                    ...this.state.rows.map((row) =>
                      this.props.table.columns.map((column) => {
                        const ColumnTypeComponent = this.props
                          .columnTypeComponents[column.type];
                        const value = row[column.name];
                        return row[column.name] === null || column.secret
                          ? ""
                          : ColumnTypeComponent.valueAsText(value);
                      })
                    ),
                  ]);
                },
              },
              `Copy rows (csv)`
            )
          )
      ),
      h(
        Container,
        null,
        h(
          Filters,
          {
            filterTypes: this.props.filterTypes,
            filters: this.state.browseOptions.filters,
            columns: this.props.table.columns,
            onChange: (filters) => this.updateBrowseOptions({ filters }),
          },
          "Create"
        )
      ),
      h(Table, {
        columnTitles: [
          this.state.rows !== null &&
            h("input", {
              type: "checkbox",
              className: "Table__checkbox",
              disabled: !this.props.table.primaryKey,
              title: this.props.table.primaryKey
                ? "Select all"
                : "Selecting rows is not possible because this table does not have a Primary Key",
              checked:
                this.state.selectedRows.length > 0 &&
                this.state.selectedRows.length === this.state.rows.length,
              onChange: (event) => {
                this.setState({
                  selectedRows: event.target.checked
                    ? this.state.rows.map(
                        (row) => row[this.props.table.primaryKey]
                      )
                    : [],
                });
              },
            }),
          ...this.props.table.columns.map(this.renderColumnTitle),
          "Relations",
        ],
        rows:
          this.state.rows === null ? [] : this.state.rows.map(this.renderRow),
        blankSlateContent: this.state.rows === null ? "Loading…" : "No rows.",
        columnWidths: [
          30,
          ...this.props.table.columns.map((column) =>
            this.state.presentationOptions.collapsedColumns.includes(
              column.name
            )
              ? 40
              : "auto"
          ),
          "auto",
        ],
      }),
      h(
        Container,
        null,
        h(
          LayoutColumns,
          { justifyEvenly: true, centerVertically: true },
          h(
            TotalResults,
            null,
            `Total results: ${
              this.state.totalResults !== null
                ? this.state.totalResults
                : "Unknown"
            }`
          ),
          this.state.totalResults > 0 &&
            h(Pagination, {
              currentPage: this.state.browseOptions.currentPage,
              totalPages: this.state.totalPages,
              showPreviousNextButtons: true,
              onChange: (currentPage) =>
                this.updateBrowseOptions({ currentPage }),
            }),
          h(
            "span",
            null,
            this.state.totalPages > 5 &&
              h(Select, {
                slim: true,
                options: range(1, this.state.totalPages).map((value) => ({
                  value,
                  text: `Jump to page: ${value}`,
                })),
                value: this.state.browseOptions.currentPage,
                onChange: (currentPage) =>
                  this.updateBrowseOptions({ currentPage }),
              }),
            " ",
            h(Select, {
              slim: true,
              options: [10, 100, 500, 2000].map((value) => ({
                value,
                text: `Per page: ${value}`,
              })),
              value: this.state.browseOptions.perPage,
              onChange: (perPage) =>
                this.updateBrowseOptions({ perPage, currentPage: 1 }),
            })
          )
        )
      )
    );
  }
}

export default BrowseTable;
