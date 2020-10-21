import { Component, createElement as h, Fragment } from "react";
import { Redirect, Link } from "react-router-dom";
import { editRowUrl, browseTableUrl } from "../urls";
import Button, { ButtonStyles } from "../components/Button";
import CheckboxInput from "../components/CheckboxInput";
import Code from "../components/Code";
import Container from "../components/Container";
import FormHelpMessage from "../components/FormHelpMessage";
import { NotificationStyles } from "../components/Notifications";
import LayoutColumns from "../components/LayoutColumns";
import RowEditLabel from "../components/RowEditLabel";
import PageTitle from "../components/PageTitle";
import Table from "../components/Table";
import TextInput from "../components/TextInput";
import niceifyName from "../utils/niceifyName";
import doubleQuotes from "../utils/doubleQuotes";

const STATUS = {
  LOADING: "LOADING",
  DEFAULT: "DEFAULT",
  SAVING: "SAVING",
};

class EditRow extends Component {
  constructor() {
    super();

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

  async componentDidMount() {
    this.setState({ status: STATUS.LOADING });
    await this.getRow();
    this.setState({ status: STATUS.DEFAULT });
  }

  async getRow() {
    if (this.props.rowId) {
      const { rows } = await this.props.catchApiError(
        this.props.api.getTableRows(this.props.table, {
          perPage: 1,
          filters: [
            {
              type: "equals",
              columnName: this.props.table.primaryKey,
              value: this.props.rowId,
            },
          ],
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

  requiredFieldsAreFilledIn() {
    for (let column of this.props.table.columns) {
      if (column.secret || column.nullable || column.autoIncrements) {
        continue;
      }
      if (this.state.row[column.name] === null) {
        return false;
      }
    }
    return true;
  }

  async saveChanges() {
    let savedRow;
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
      console.error(exception);
      this.setState({ status: STATUS.DEFAULT });
    }
  }

  async deleteRow() {
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

  updateRowProperty(property, value) {
    const obj = {};
    obj[property] = value;
    this.setState({
      row: Object.assign({}, this.state.row, obj),
    });
  }

  renderValueCell(column, ColumnTypeComponent) {
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

  renderSetToNullCell(column) {
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

  renderRow(column) {
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

  render() {
    if (this.state.redirectToNewlyCreatedRow) {
      const rowId = this.state.redirectToNewlyCreatedRow[
        this.props.table.primaryKey
      ];
      return h(Redirect, { to: editRowUrl(this.props.table, rowId) });
    }

    if (this.state.redirectToBrowseAfterDeletion) {
      return h(Redirect, { to: browseTableUrl(this.props.table.name) });
    }

    if (this.state.status === STATUS.LOADING) {
      return h(Container, null, "Loading…");
    }

    if (!this.state.row) {
      return h(
        Fragment,
        null,
        h(PageTitle, null, "Row not found"),
        h(Container, null, "Row not found…")
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
        { to: browseTableUrl(this.props.table.name) },
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
        )
      )
    );
  }
}

export default EditRow;
