import {
  Component,
  createElement as h,
  Fragment,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { Redirect, Link } from "react-router-dom";
import {
  HelppoColumn,
  HelppoSchema,
  HelppoTable,
  QueryParam,
  RowObject,
} from "../../sharedTypes";
import Api from "../Api";
import {
  CatchApiError,
  ColumnTypeComponents,
  RememberDeletedRow,
  ShowNotification,
} from "../App";
import Images from "../Images";
import Urls from "../Urls";
import BaseColumnType from "../components/BaseColumnType";
import Button, { ButtonStyles } from "../components/Button";
import CheckboxInput from "../components/CheckboxInput";
import Code from "../components/Code";
import Container from "../components/Container";
import FormHelpMessage from "../components/FormHelpMessage";
import HeadingBlock from "../components/HeadingBlock";
import InlineLink from "../components/InlineLink";
import LayoutColumns from "../components/LayoutColumns";
import LoadingSpinner from "../components/LoadingSpinner";
import { NotificationStyles } from "../components/Notifications";
import PageTitle from "../components/PageTitle";
import RowEditLabel from "../components/RowEditLabel";
import Table from "../components/Table";
import TableLink, { TableLinkStyles } from "../components/TableLink";
import TextInput from "../components/TextInput";
import doubleQuotes from "../utils/doubleQuotes";
import limitText from "../utils/limitText";
import niceifyName from "../utils/niceifyName";

interface RelatedRowsProps {
  api: Pick<Api, "getTableRows">;
  urls: Pick<Urls, "browseTableUrl">;
  schema: HelppoSchema;
  table: HelppoTable;
  row: RowObject;
  columnTypeComponents: ColumnTypeComponents;
}

const RelatedRows = ({
  api,
  urls,
  schema,
  table,
  row,
  columnTypeComponents,
}: RelatedRowsProps): ReactElement => {
  const loading = "LOADING";
  const errored = "ERRORED";
  const ready = "READY";

  const [status, setStatus] = useState(loading);
  const [collections, setCollections] = useState(null);

  useEffect(() => {
    const referencesToOtherTables = table.columns.reduce(
      (collections, column) => {
        if (column.referencesTable) {
          collections.push({
            table: schema.tables.find(
              (table) => table.name === column.referencesTable
            ),
            columnName: column.referencesColumn,
            value: row[column.name],
          });
        }
        return collections;
      },
      []
    );

    const columnsReferencingThisTable = schema.tables.reduce(
      (matches, otherTable) => {
        otherTable.columns.forEach((column) => {
          if (column.referencesTable === table.name) {
            matches.push({
              table: otherTable,
              columnName: column.name,
              value: row[column.referencesColumn],
            });
          }
        });
        return matches;
      },
      []
    );

    Promise.all(
      [...referencesToOtherTables, ...columnsReferencingThisTable].map(
        (collection) => {
          return api
            .getTableRows(collection.table.name, {
              perPage: 5,
              filters: [
                {
                  type: "equals",
                  columnName: collection.columnName,
                  value: collection.value,
                },
              ],
              currentPage: 1,
              orderByColumn: null,
              orderByDirection: "asc",
              wildcardSearch: "",
            })
            .then((results) => {
              return {
                ...collection,
                results,
              };
            });
        }
      )
    )
      .then((collections) => {
        setCollections(collections);
        setStatus(ready);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        setStatus(errored);
      });
  }, [api, row, schema, table]);

  if (status === loading) {
    return h(Container, null, h(LoadingSpinner, { height: 16 }));
  }

  if (status === errored) {
    return h(Container, null, "Something went wrong.");
  }

  if (!collections.length) {
    return h(Container, null, "No relations to other tables.");
  }

  return h(
    Fragment,
    null,
    collections.map((collection, index) => {
      const columns = collection.table.columns.filter(
        (column) => !column.secret
      );
      return h(
        Fragment,
        { key: index },
        h(
          HeadingBlock,
          { level: 2 },
          `Related rows in ${niceifyName(collection.table.name)}`
        ),
        h(
          Container,
          null,
          h(Table, {
            tiny: true,
            blankSlateContent: "No rows.",
            columnTitles: columns.map((column) => niceifyName(column.name)),
            rows: collection.results.rows.map((row) =>
              columns.map((column) => {
                const value = row[column.name];
                if (value === null) {
                  return h(Code, null, "NULL");
                }
                const ColumnTypeComponent = columnTypeComponents[column.type];
                if (column.name === collection.table.primaryKey) {
                  return h(
                    TableLink,
                    {
                      style: TableLinkStyles.ROUNDED,
                      tiny: true,
                      to: urls.browseTableUrl(collection.table.name, {
                        filters: [
                          {
                            type: "equals",
                            columnName: column.name,
                            value: value,
                          },
                        ],
                      }),
                    },
                    ColumnTypeComponent.valueAsText(value)
                  );
                }
                return limitText(ColumnTypeComponent.valueAsText(value), 50);
              })
            ),
          })
        ),
        h(
          Container,
          { verticalSlim: true },
          h(
            Button,
            {
              to: urls.browseTableUrl(collection.table.name, {
                filters: [
                  {
                    type: "equals",
                    columnName: collection.columnName,
                    value: collection.value,
                  },
                ],
              }),
              style: ButtonStyles.GHOST,
              slim: true,
            },
            `Browse all ${collection.results.totalResults} results`
          )
        )
      );
    })
  );
};

enum STATUS {
  LOADING = "LOADING",
  DEFAULT = "DEFAULT",
  SAVING = "SAVING",
}

interface EditRowProps {
  api: Pick<Api, "getTableRows" | "saveRow" | "deleteRow">;
  urls: Pick<Urls, "editRowUrl" | "browseTableUrl" | "tableIndexUrl">;
  images: Images;
  columnTypeComponents: ColumnTypeComponents;
  catchApiError: CatchApiError;
  showNotification: ShowNotification;
  rememberDeletedRow: RememberDeletedRow;
  schema: HelppoSchema;
  table: HelppoTable;
  rowId: QueryParam;
}

interface EditRowState {
  status: STATUS;
  originalRow: RowObject;
  row: RowObject;
  redirectToNewlyCreatedRow: RowObject;
  redirectToBrowseAfterDeletion: boolean;
  editableSecretColumns: string[];
  autoFocusColumn: string;
}

class EditRow extends Component<EditRowProps, EditRowState> {
  constructor(props: EditRowProps) {
    super(props);

    this.state = {
      status: STATUS.LOADING,
      originalRow: null,
      row: null,
      redirectToNewlyCreatedRow: null,
      redirectToBrowseAfterDeletion: false,
      editableSecretColumns: [],
      autoFocusColumn: null,
    };

    this.getRow = this.getRow.bind(this);
    this.updateRowProperty = this.updateRowProperty.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderValueCell = this.renderValueCell.bind(this);
    this.renderSetToNullCell = this.renderSetToNullCell.bind(this);
    this.requiredFieldsAreFilledIn = this.requiredFieldsAreFilledIn.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
  }

  async componentDidMount(): Promise<void> {
    this.setState({ status: STATUS.LOADING });
    await this.getRow();
    this.setState({ status: STATUS.DEFAULT });
  }

  async getRow(): Promise<void> {
    if (this.props.rowId) {
      const { rows } = await this.props.catchApiError(
        this.props.api.getTableRows(this.props.table.name, {
          perPage: 1,
          filters: [
            {
              type: "equals",
              columnName: this.props.table.primaryKey,
              value: this.props.rowId,
            },
          ],
          currentPage: 1,
          orderByColumn: null,
          orderByDirection: "asc",
          wildcardSearch: "",
        })
      );
      const row = rows[0];
      this.setState({ row, originalRow: row });
    } else {
      const row = {};
      this.props.table.columns.forEach((column) => {
        row[column.name] = null;
      });
      this.setState({ row, originalRow: {} });
    }
  }

  requiredFieldsAreFilledIn(): boolean {
    for (const column of this.props.table.columns) {
      if (column.secret || column.nullable || column.autoIncrements) {
        continue;
      }
      if (this.state.row[column.name] === null) {
        return false;
      }
    }
    return true;
  }

  async saveChanges(): Promise<void> {
    let savedRow: RowObject;
    const changedProperties = Object.keys(this.state.row).filter((key) => {
      return this.state.row[key] !== this.state.originalRow[key];
    });
    if (!changedProperties.length) {
      return;
    }
    this.setState({ status: STATUS.SAVING });
    try {
      const changedData = changedProperties.reduce((obj, key) => {
        obj[key] = this.state.row[key];
        return obj;
      }, {});
      savedRow = await this.props.catchApiError(
        this.props.api.saveRow(this.props.table, this.props.rowId, changedData)
      );
      if (!this.props.rowId) {
        this.props.showNotification(
          `Row ${doubleQuotes(
            savedRow[this.props.table.primaryKey]
          )} was created`,
          {
            style: NotificationStyles.SUCCESS,
          }
        );
        this.setState({ redirectToNewlyCreatedRow: savedRow });
      } else {
        this.props.showNotification(
          `Row ${doubleQuotes(this.props.rowId)} was saved`,
          {
            style: NotificationStyles.SUCCESS,
          }
        );
        this.setState({ status: STATUS.DEFAULT, editableSecretColumns: [] });
        await this.getRow();
      }
    } catch (exception) {
      // eslint-disable-next-line no-console
      console.error(exception);
      this.setState({ status: STATUS.DEFAULT });
    }
  }

  async deleteRow(): Promise<void> {
    this.setState({ status: STATUS.SAVING });
    try {
      this.props.rememberDeletedRow(this.props.table, this.state.row);
      await this.props.catchApiError(
        this.props.api.deleteRow(this.props.table, this.props.rowId)
      );
      this.props.showNotification(
        `Row ${doubleQuotes(this.props.rowId)} was deleted`
      );
      this.setState({ redirectToBrowseAfterDeletion: true });
    } catch (exception) {
      this.setState({ status: STATUS.DEFAULT });
    }
  }

  updateRowProperty(property: string, value: QueryParam): void {
    const obj = {};
    obj[property] = value;
    this.setState({
      row: Object.assign({}, this.state.row, obj),
    });
  }

  renderValueCell(
    column: HelppoColumn,
    ColumnTypeComponent: typeof BaseColumnType
  ): ReactElement {
    const comment = column.comment && h(FormHelpMessage, null, column.comment);

    if (
      column.secret &&
      !this.state.editableSecretColumns.includes(column.name)
    ) {
      return h(
        Fragment,
        null,
        h(TextInput, {
          key: "secret",
          disabled: true,
          size: 10,
          value: "*****",
        }),
        h(
          Button,
          {
            style: ButtonStyles.LINK,
            slim: true,
            disabled: this.state.status === STATUS.SAVING,
            onClick: () =>
              this.setState({
                editableSecretColumns: [
                  ...this.state.editableSecretColumns,
                  column.name,
                ],
                autoFocusColumn: column.name,
              }),
          },
          "Edit value"
        ),
        comment
      );
    }

    const value = this.state.row[column.name];

    return h(
      Fragment,
      null,
      h(ColumnTypeComponent, {
        editable: true,
        value,
        images: this.props.images,
        onChange: (newValue) => this.updateRowProperty(column.name, newValue),
        inputProps: {
          autoFocus: this.state.autoFocusColumn === column.name,
          placeholder: column.nullable ? "NULL" : "",
        },
        column,
      }),
      comment
    );
  }

  renderSetToNullCell(column: HelppoColumn): ReactElement {
    if (column.nullable || column.autoIncrements) {
      return h(
        CheckboxInput,
        {
          checked: this.state.row[column.name] === null,
          onChange: () => this.updateRowProperty(column.name, null),
        },
        h(Code, null, "NULL")
      );
    }
    return null;
  }

  renderRow(column: HelppoColumn): ReactElement[] {
    const ColumnTypeComponent = this.props.columnTypeComponents[column.type];
    return [
      h(RowEditLabel, {
        columnName: niceifyName(column.name),
        columnType: column.type,
        hasUnsavedChanges:
          this.state.row[column.name] !== this.state.originalRow[column.name],
        undoChanges: () =>
          this.updateRowProperty(
            column.name,
            this.state.originalRow[column.name]
          ),
      }),
      this.renderValueCell(column, ColumnTypeComponent),
      this.renderSetToNullCell(column),
    ];
  }

  render(): ReactElement {
    if (this.state.redirectToNewlyCreatedRow) {
      const rowId = this.state.redirectToNewlyCreatedRow[
        this.props.table.primaryKey
      ];
      return h(Redirect, {
        to: this.props.urls.editRowUrl(this.props.table, rowId),
      });
    }

    if (this.state.redirectToBrowseAfterDeletion) {
      return h(Redirect, {
        to: this.props.urls.browseTableUrl(this.props.table.name),
      });
    }

    if (this.state.status === STATUS.LOADING) {
      return h(Container, null, h(LoadingSpinner, { height: 16 }));
    }

    if (!this.state.row) {
      return h(
        Fragment,
        null,
        h(PageTitle, null, `Row ${doubleQuotes(this.props.rowId)} not found`),
        h(
          Container,
          null,
          `Row ${doubleQuotes(this.props.rowId)} not found. `,
          h(
            InlineLink,
            { to: this.props.urls.tableIndexUrl(this.props.table) },
            `Go back to ${niceifyName(this.props.table.name)}.`
          )
        )
      );
    }

    const titleBegin = this.props.rowId
      ? `Edit row ${doubleQuotes(this.props.rowId)}`
      : "New";
    const textTitle = `${titleBegin} row in ${niceifyName(
      this.props.table.name
    )}`;
    const domTitle = h(
      Fragment,
      null,
      `${titleBegin} row in `,
      h(
        Link,
        { to: this.props.urls.browseTableUrl(this.props.table.name) },
        niceifyName(this.props.table.name)
      )
    );

    return h(
      "div",
      null,
      h(PageTitle, null, textTitle),
      h(
        "form",
        {
          onSubmit: (event) => {
            event.preventDefault();
            this.saveChanges();
          },
        },
        h(Table, {
          marginTop: true,
          columnTitles: [domTitle, "", ""],
          columnWidths: ["18%", "50%", "auto"],
          columnVerticalAlignments: [null, null, "middle"],
          leftColumnIsTh: true,
          rows: this.props.table.columns.map(this.renderRow),
        }),
        h(
          Container,
          null,
          h(
            LayoutColumns,
            { justifyEvenly: true },
            h(
              Button,
              {
                style: ButtonStyles.SUCCESS,
                type: "submit",
                disabled:
                  this.state.status === STATUS.SAVING ||
                  !this.requiredFieldsAreFilledIn(),
              },
              this.props.rowId ? "Save changes" : "Create"
            ),
            this.props.rowId &&
              h(
                Button,
                {
                  style: ButtonStyles.DANGER,
                  disabled: this.state.status === STATUS.SAVING,
                  onClick: this.deleteRow,
                },
                "Delete row"
              )
          )
        ),
        h(RelatedRows, {
          api: this.props.api,
          urls: this.props.urls,
          schema: this.props.schema,
          table: this.props.table,
          columnTypeComponents: this.props.columnTypeComponents,
          row: this.state.row,
        })
      )
    );
  }
}

export default EditRow;
