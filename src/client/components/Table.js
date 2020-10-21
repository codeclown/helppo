import classNames from "classnames";
import { createElement as h } from "react";
import { Link } from "react-router-dom";

export const TableLink = ({ className, children, ...props }) => {
  return h(
    props.to ? Link : "button",
    {
      className: classNames("Table__link", className),
      ...props,
    },
    children
  );
};

const Table = ({
  columnTitles,
  columnWidths,
  columnVerticalAlignments,
  rows,
  blankSlateContent,
  marginTop,
  leftColumnIsTh,
}) => {
  const cellStyles = columnTitles.map((column, index) => {
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
        columnTitles.map((column, cellIndex) =>
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
          marginTop && "Table--marginTop",
          leftColumnIsTh && "Table--leftColumnIsTh"
        ),
      },
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
