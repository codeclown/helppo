import { debounce as debounceLib } from "debounce";
import {
  createElement as h,
  useState,
  Fragment,
  useRef,
  useEffect,
  useCallback,
  ReactElement,
} from "react";
import { Redirect } from "react-router-dom";
import {
  BrowseOptions,
  FilterType,
  HelppoColumn,
  HelppoTable,
} from "../../sharedTypes";
import Api from "../Api";
import {
  CatchApiError,
  ColumnTypeComponents,
  RememberDeletedRow,
  ShowNotification,
} from "../App";
import Urls from "../Urls";
import Button, { ButtonStyles } from "../components/Button";
import Code from "../components/Code";
import Container, { ContainerRight } from "../components/Container";
import CopyToClipboardButton from "../components/CopyToClipboardButton";
import Filters from "../components/Filters";
import HeadingBlock from "../components/HeadingBlock";
import LayoutColumns from "../components/LayoutColumns";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  NotificationStyles,
  NotificationDelays,
} from "../components/Notifications";
import PageTitle from "../components/PageTitle";
import Pagination from "../components/Pagination";
import RowPopup from "../components/RowPopup";
import Select from "../components/Select";
import Table from "../components/Table";
import TableCellTools, {
  TableCellToolsImages,
} from "../components/TableCellTools";
import TableLink, { TableLinkStyles } from "../components/TableLink";
import TextInput from "../components/TextInput";
import TotalResults from "../components/TotalResults";
import limitText from "../utils/limitText";
import naiveCsvStringify from "../utils/naiveCsvStringify";
import niceifyName from "../utils/niceifyName";
import range from "../utils/range";

interface PresentationOptions {
  collapsedColumns: string[];
}

interface ColumnTitleProps {
  presentationOptions: PresentationOptions;
  images: TableCellToolsImages;
  urls: Pick<Urls, "browseTableUrl">;
  table: HelppoTable;
  browseOptions: BrowseOptions;
  column: HelppoColumn;
}

export const ColumnTitle = ({
  presentationOptions,
  images,
  urls,
  table,
  browseOptions,
  column,
}: ColumnTitleProps): ReactElement => {
  const niceName = niceifyName(column.name);
  const isPrimaryKey = table.primaryKey === column.name;

  if (presentationOptions.collapsedColumns.includes(column.name)) {
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
        images,
        isPrimaryKey,
        uncollapseColumnUrl: urls.browseTableUrl(table.name, browseOptions, {
          collapsedColumns: presentationOptions.collapsedColumns.filter(
            (name) => name !== column.name
          ),
        }),
      })
    );
  }

  const { orderByColumn, orderByDirection } = browseOptions;
  const sorted = orderByColumn === column.name;
  const sortedAsc = sorted && orderByDirection === "asc";
  const sortedDesc = sorted && orderByDirection === "desc";

  return h(
    Fragment,
    null,
    h("span", null, niceName),
    h(TableCellTools, {
      images,
      isPrimaryKey,
      columnComment: column.comment,
      collapseColumnUrl: urls.browseTableUrl(table.name, browseOptions, {
        collapsedColumns: [
          ...presentationOptions.collapsedColumns,
          column.name,
        ],
      }),
      sortedAsc,
      sortAscUrl: sortedAsc
        ? null
        : urls.browseTableUrl(
            table.name,
            {
              ...browseOptions,
              orderByColumn: column.name,
              orderByDirection: "asc",
            },
            presentationOptions
          ),
      sortedDesc,
      sortDescUrl: sortedDesc
        ? null
        : urls.browseTableUrl(
            table.name,
            {
              ...browseOptions,
              orderByColumn: column.name,
              orderByDirection: "desc",
            },
            presentationOptions
          ),
    })
  );
};

const Cell = ({
  row,
  column,
  columnTypeComponents,
  presentationOptions,
  filterTypes,
  urls,
  table,
  browseOptions,
  images,
  containerRef,
  api,
}) => {
  const value = row[column.name];
  const ColumnTypeComponent = columnTypeComponents[column.type];

  if (presentationOptions.collapsedColumns.includes(column.name)) {
    const string = value === null ? "" : ColumnTypeComponent.valueAsText(value);
    return h(
      "span",
      {
        title: limitText(string, 200),
      },
      "…"
    );
  }

  const availableFilterTypes = column.secret
    ? []
    : filterTypes.filter((filterType) => {
        return filterType.columnTypes.includes(column.type);
      });

  const filterUrls = availableFilterTypes.map((filterType) => {
    return {
      name: filterType.name,
      url: urls.browseTableUrl(
        table.name,
        {
          filters: [
            ...browseOptions.filters,
            { type: filterType.key, columnName: column.name, value },
          ],
          wildcardSearch: browseOptions.wildcardSearch,
        },
        presentationOptions
      ),
    };
  });

  return h(
    Fragment,
    null,
    h(Value, {
      column,
      value,
      table,
      ColumnTypeComponent,
      urls,
      api,
      containerRef,
      images,
    }),
    h(TableCellTools, {
      images,
      filterUrls,
      dropdownContainer: containerRef.current,
    })
  );
};

const Value = ({
  column,
  value,
  table,
  ColumnTypeComponent,
  urls,
  api,
  containerRef,
  images,
}) => {
  if (column.secret) {
    return h("span", { title: "Value is hidden" }, "*****");
  }

  if (value === null) {
    return h(Code, null, "NULL");
  }

  if (column.name === table.primaryKey) {
    return h(
      TableLink,
      {
        style: TableLinkStyles.ROUNDED,
        to: urls.editRowUrl(table, value),
      },
      ColumnTypeComponent.valueAsText(value)
    );
  }

  if (column.referencesColumn) {
    return h(
      RowPopup,
      {
        popupContainer: containerRef.current,
        getRow: async () => {
          const { rows } = await api.getTableRows(column.referencesTable, {
            perPage: 1,
            currentPage: 1,
            filters: [
              {
                type: "equals",
                columnName: column.referencesColumn,
                value,
              },
            ],
          });
          return rows[0];
        },
      },
      h(
        TableLink,
        {
          to: urls.browseTableUrl(
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
      )
    );
  }

  return h(ColumnTypeComponent, {
    editable: false,
    value,
    images,
  });
};

const RelatedTableLinks = ({ relations, row, urls }) => {
  if (relations.length === 0) {
    return "–";
  }
  return relations.map((relation) => {
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
        to: urls.browseTableUrl(relation.table.name, { filters }),
      },
      niceifyName(relation.table.name)
    );
  });
};

export interface BrowseTableProps {
  locationKey: string;
  api: Pick<Api, "getTableRows" | "deleteRow">;
  urls: Pick<Urls, "browseTableUrl" | "editRowUrl">;
  images: TableCellToolsImages;
  columnTypeComponents: ColumnTypeComponents;
  filterTypes: FilterType[];
  catchApiError: CatchApiError;
  showNotification: ShowNotification;
  rememberDeletedRow: RememberDeletedRow;
  table: HelppoTable;
  relations: {
    table: HelppoTable;
    column: HelppoColumn;
  }[];
  browseOptions: BrowseOptions;
  presentationOptions: PresentationOptions;
  debounce?: typeof debounceLib;
}

const BrowseTable = ({
  locationKey,
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
  browseOptions,
  presentationOptions,
  debounce = debounceLib,
}: BrowseTableProps): ReactElement => {
  const containerRef = useRef();
  const [rows, setRows] = useState(null);
  const [totalResults, setTotalResults] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [redirectTo, setRedirectTo] = useState(null);
  const [wildcardSearch, setWildcardSearch] = useState(
    browseOptions.wildcardSearch
  );

  const getRows = useCallback(async () => {
    const { rows, totalPages, totalResults } = await catchApiError(
      api.getTableRows(table.name, browseOptions)
    );
    setTotalPages(totalPages);
    setTotalResults(totalResults);
    setRows(rows);
  }, [table, browseOptions, api, catchApiError]);

  const deleteSelectedRows = useCallback(async () => {
    // Safe guard limiting only to a subset of visible rows, as it should be,
    // just in case there has been a state mess-up
    const visibleRowIds = rows.map((row) => row[table.primaryKey]);
    const rowIdsToDelete = selectedRows.filter((rowId) =>
      visibleRowIds.includes(rowId)
    );
    if (!rowIdsToDelete.length) {
      return;
    }
    const successfullyDeleted = [];
    await Promise.all(
      rowIdsToDelete.map(async (rowId) => {
        const row = rows.find((row) => row[table.primaryKey] === rowId);
        try {
          await api.deleteRow(table, rowId);
          successfullyDeleted.push(rowId);
          rememberDeletedRow(table, row);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
          showNotification(`Deleting row ${rowId} failed`, {
            style: NotificationStyles.DANGER,
            clearAfter: NotificationDelays.SLOW,
          });
        }
      })
    );
    if (successfullyDeleted.length) {
      showNotification(
        `Row${
          successfullyDeleted.length === 1 ? "" : "s"
        } ${successfullyDeleted.join(", ")} ${
          successfullyDeleted.length === 1 ? "was" : "were"
        } deleted`
      );
    }
    await getRows();
    const stillVisibleRowIds = rows.map((row) => row[table.primaryKey]);
    const selectedRowIdsToRemain = selectedRows.filter((rowId) =>
      stillVisibleRowIds.includes(rowId)
    );
    setSelectedRows(selectedRowIdsToRemain);
  }, [
    rows,
    table,
    selectedRows,
    api,
    getRows,
    rememberDeletedRow,
    showNotification,
  ]);

  const updateBrowseOptions = useCallback(
    (updated, push = true) => {
      const to = urls.browseTableUrl(
        table.name,
        Object.assign({}, browseOptions, updated),
        presentationOptions
      );
      setRedirectTo({ to, push });
    },
    [table, browseOptions, presentationOptions, urls]
  );

  const debouncedWildcardSearch = useCallback(
    (newValue: string) => {
      const debounced = debounce(
        (newValue: string) =>
          updateBrowseOptions(
            { wildcardSearch: newValue },
            browseOptions.wildcardSearch !== ""
          ),
        500
      );
      debounced(newValue);
    },
    [updateBrowseOptions, browseOptions, debounce]
  );

  useEffect(() => {
    setRedirectTo(null);
    setWildcardSearch(browseOptions.wildcardSearch);
    getRows();
  }, [locationKey, table, browseOptions, getRows]);

  const title = niceifyName(table.name);

  return h(
    "div",
    { ref: containerRef },
    redirectTo && h(Redirect, { ...redirectTo }),
    h(PageTitle, null, title),
    h(HeadingBlock, { level: 2 }, title),
    h(
      Container,
      { horizontal: true },
      h(
        Button,
        {
          style: ButtonStyles.SUCCESS,
          to: urls.editRowUrl(table),
        },
        "Create"
      ),
      selectedRows.length !== 0 &&
        h(
          Fragment,
          null,
          h(
            Button,
            {
              style: ButtonStyles.DANGER,
              onClick: deleteSelectedRows,
            },
            `Delete ${selectedRows.length} rows`
          ),
          h(
            CopyToClipboardButton,
            {
              style: ButtonStyles.GHOST,
              onCopy: () => {
                const column = table.columns.find(
                  (column) => column.name === table.primaryKey
                );
                const ColumnTypeComponent = columnTypeComponents[column.type];
                return rows
                  .map((row) => {
                    const value = row[table.primaryKey];
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
            `Copy ${niceifyName(table.primaryKey)} values`
          ),
          h(
            CopyToClipboardButton,
            {
              style: ButtonStyles.GHOST,
              onCopy: () => {
                return naiveCsvStringify([
                  table.columns.map((column) => column.name),
                  ...rows.map((row) =>
                    table.columns.map((column) => {
                      const ColumnTypeComponent =
                        columnTypeComponents[column.type];
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
        ),
      h(
        ContainerRight,
        null,
        h(TextInput, {
          placeholder: "Search…",
          size: 24,
          value: wildcardSearch,
          onChange: (value) => {
            setWildcardSearch(value);
            debouncedWildcardSearch(value);
          },
        })
      )
    ),
    h(
      Container,
      null,
      h(Filters, {
        key: locationKey,
        filterTypes: filterTypes,
        filters: browseOptions.filters,
        columns: table.columns,
        onChange: (filters) => updateBrowseOptions({ filters }),
      })
    ),
    h(Table, {
      columnTitles: [
        rows !== null &&
          h("input", {
            type: "checkbox",
            className: "Table__checkbox",
            disabled: !table.primaryKey,
            title: table.primaryKey
              ? "Select all"
              : "Selecting rows is not possible because this table does not have a Primary Key",
            checked:
              selectedRows.length > 0 && selectedRows.length === rows.length,
            onChange: (event) => {
              setSelectedRows(
                event.target.checked
                  ? rows.map((row) => row[table.primaryKey])
                  : []
              );
            },
          }),
        ...table.columns.map((column, index) =>
          h(ColumnTitle, {
            key: index,
            presentationOptions,
            images,
            urls,
            table,
            browseOptions,
            column,
          })
        ),
        "Relations",
      ],
      rows:
        rows === null
          ? []
          : rows.map((row) => {
              const primaryKey = table.primaryKey && row[table.primaryKey];
              return [
                table.primaryKey &&
                  h("input", {
                    type: "checkbox",
                    className: "Table__checkbox",
                    checked: selectedRows.includes(primaryKey),
                    onChange: (event) => {
                      setSelectedRows(
                        event.target.checked
                          ? [...selectedRows, primaryKey]
                          : selectedRows.filter((item) => item !== primaryKey)
                      );
                    },
                  }),
                ...table.columns.map((column, index) =>
                  h(Cell, {
                    key: index,
                    row,
                    column,
                    columnTypeComponents,
                    presentationOptions,
                    filterTypes,
                    urls,
                    table,
                    browseOptions,
                    images,
                    containerRef,
                    api,
                  })
                ),
                h(RelatedTableLinks, { relations, row, urls }),
              ];
            }),
      blankSlateContent:
        rows === null
          ? h(LoadingSpinner, { height: 16, dim: true })
          : "No rows.",
      columnWidths: [
        30,
        ...table.columns.map((column) =>
          presentationOptions.collapsedColumns.includes(column.name)
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
          `Total results: ${totalResults !== null ? totalResults : "Unknown"}`
        ),
        totalResults > 0 &&
          h(Pagination, {
            currentPage: browseOptions.currentPage,
            totalPages: totalPages,
            showPreviousNextButtons: true,
            onChange: (currentPage) => updateBrowseOptions({ currentPage }),
          }),
        h(
          "span",
          null,
          totalPages > 5 &&
            h(Select, {
              slim: true,
              options: range(1, totalPages).map((value) => ({
                value,
                text: `Jump to page: ${value}`,
              })),
              value: browseOptions.currentPage,
              onChange: (currentPage) => updateBrowseOptions({ currentPage }),
            }),
          " ",
          h(Select, {
            slim: true,
            options: [20, 100, 500, 2000].map((value) => ({
              value,
              text: `Per page: ${value}`,
            })),
            value: browseOptions.perPage,
            onChange: (perPage) =>
              updateBrowseOptions({ perPage, currentPage: 1 }),
          })
        )
      )
    )
  );
};

export default BrowseTable;
