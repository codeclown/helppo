import classNames from "classnames";
import { createElement as h } from "react";

const Table = ({
  tiny,
  noBorder,
  columnTitles,
  columnWidths,
  columnVerticalAlignments,
  rows,
  blankSlateContent,
  marginTop,
  leftColumnIsTh,
}) => {
  const columnCountArray =
    columnTitles ||
    columnWidths ||
    columnVerticalAlignments ||
    Object.keys(rows[0]);
  const cellStyles = columnCountArray.map((column, index) => {
    const styles = {};
    if (columnWidths && columnWidths[index]) {
      styles.width = columnWidths[index];
    }
    if (columnVerticalAlignments && columnVerticalAlignments[index]) {
      styles.verticalAlign = columnVerticalAlignments[index];
    }
    return styles;
  });

  let bodyContent = [];
  if (rows.length) {
    bodyContent = rows.map((cells, index) =>
      h(
        "tr",
        {
          key: index,
        },
        columnCountArray.map((column, cellIndex) =>
          h(
            "td",
            {
              key: cellIndex,
              style: cellStyles[cellIndex],
            },
            cells[cellIndex]
          )
        )
      )
    );
  } else if (blankSlateContent) {
    bodyContent = [
      h(
        "tr",
        null,
        h(
          "td",
          {
            className: "blank-slate",
            colSpan: columnTitles.length,
          },
          blankSlateContent
        )
      ),
    ];
  }

  return h(
    "div",
    { className: "Table-wrapper" },
    h(
      "table",
      {
        className: classNames(
          "Table",
          tiny && "Table--tiny",
          noBorder && "Table--noBorder",
          marginTop && "Table--marginTop",
          leftColumnIsTh && "Table--leftColumnIsTh"
        ),
      },
      columnTitles &&
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            columnTitles.map((title, index) =>
              h(
                "th",
                {
                  key: index,
                },
                title
              )
            )
          )
        ),
      h("tbody", null, ...bodyContent)
    )
  );
};

export default Table;
