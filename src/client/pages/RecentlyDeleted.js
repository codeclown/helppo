import { Component, createElement as h, Fragment } from "react";
import Code from "../components/Code";
import Container from "../components/Container";
import Table, { TableLink } from "../components/Table";
import PageTitle from "../components/PageTitle";
import limitText from "../utils/limitText";
import niceifyName from "../utils/niceifyName";

class RecentlyDeleted extends Component {
  render() {
    const { tables, rows, restoreRow } = this.props;
    return h(
      Fragment,
      null,
      h(PageTitle, null, "Recently deleted rows"),
      h(
        Container,
        null,
        "This page lists the 10 last rows you deleted. They are only stored in memory; the list will be cleared if you refresh the page."
      ),
      rows.length === 0 && h(Container, null, "No rows to show at this time."),
      rows.map((obj, index) => {
        const { tableName, row, pending } = obj;
        const table = tables.find((item) => item.name === tableName);
        // Values for secret columns are not available, so they can't be restored
        const canBeRestored = !table.columns.some((column) => column.secret);
        return h(
          Fragment,
          { key: index },
          // h(Container, null, `Rows deleted from ${niceifyName(tableName)}:`),
          h(Table, {
            columnTitles: [
              niceifyName(tableName),
              ...table.columns.map((column) => niceifyName(column.name)),
            ],
            rows: [
              [
                h(
                  TableLink,
                  {
                    onClick: () => restoreRow(obj),
                    disabled: pending || !canBeRestored,
                    title: canBeRestored
                      ? `Save the row back to ${niceifyName(tableName)}`
                      : "This row contains secret values and is not restorable",
                  },
                  "Restore"
                ),
                ...table.columns.map((column) => {
                  if (column.secret) {
                    return "***";
                  }
                  if (row[column.name] === null) {
                    return h(Code, null, "NULL");
                  }
                  const string = row[column.name].toString();
                  return h(
                    "span",
                    {
                      title: string.length > 10 ? limitText(string, 600) : "",
                    },
                    limitText(string, 10)
                  );
                }),
              ],
            ],
          })
        );
      })
    );
  }
}

export default RecentlyDeleted;
