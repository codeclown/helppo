import { createElement as h, Fragment, ReactElement } from "react";
import { HelppoTable } from "../../sharedTypes";
import { RecentlyDeletedRow } from "../App";
import Code from "../components/Code";
import Container from "../components/Container";
import PageTitle from "../components/PageTitle";
import Table from "../components/Table";
import TableLink, { TableLinkStyles } from "../components/TableLink";
import limitText from "../utils/limitText";
import niceifyName from "../utils/niceifyName";

interface RecentlyDeletedProps {
  tables: HelppoTable[];
  rows: RecentlyDeletedRow[];
  restoreRow: (row: RecentlyDeletedRow) => void;
}

export default function RecentlyDeleted({
  tables,
  rows,
  restoreRow,
}: RecentlyDeletedProps): ReactElement {
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
                  style: TableLinkStyles.ROUNDED,
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
