import { createElement as h } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";

const TableCellToolsItem = ({ href, imageUrl, title, showOnHover }) => {
  const icon = h("img", { src: imageUrl });

  if (href) {
    return h(
      Link,
      {
        className: classNames(
          "TableCellTools__item",
          "TableCellTools__item--clickable",
          showOnHover && "TableCellTools__item--show-on-hover"
        ),
        to: href,
        title,
      },
      icon
    );
  }

  return h(
    "span",
    {
      className: classNames(
        "TableCellTools__item",
        showOnHover && "TableCellTools__item--show-on-hover"
      ),
      title,
    },
    icon
  );
};

const TableCellTools = ({
  images,
  addAsFilterUrl,
  collapseColumnUrl,
  uncollapseColumnUrl,
  isPrimaryKey,
  columnComment,
  sortedAsc,
  sortAscUrl,
  sortedDesc,
  sortDescUrl,
}) => {
  return h(
    "span",
    {
      className: "TableCellTools",
    },
    isPrimaryKey &&
      h(TableCellToolsItem, {
        title: "Primary Key",
        imageUrl: images.primaryKey,
      }),
    columnComment &&
      h(TableCellToolsItem, {
        title: columnComment,
        imageUrl: images.columnInfo,
      }),
    sortedAsc &&
      h(TableCellToolsItem, {
        title: "Sorted by this column in ascending order",
        imageUrl: images.sortAsc,
      }),
    sortedDesc &&
      h(TableCellToolsItem, {
        title: "Sorted by this column in descending order",
        imageUrl: images.sortDesc,
      }),
    sortAscUrl &&
      h(TableCellToolsItem, {
        showOnHover: true,
        href: sortAscUrl,
        title: "Sort by this column in ascending order",
        imageUrl: images.sortAsc,
      }),
    sortDescUrl &&
      h(TableCellToolsItem, {
        showOnHover: true,
        href: sortDescUrl,
        title: "Sort by this column in descending order",
        imageUrl: images.sortDesc,
      }),
    addAsFilterUrl &&
      h(TableCellToolsItem, {
        showOnHover: true,
        href: addAsFilterUrl,
        title: "Add this value as a filter",
        imageUrl: images.magnifier,
      }),
    collapseColumnUrl &&
      h(TableCellToolsItem, {
        showOnHover: true,
        href: collapseColumnUrl,
        title: "Collapse this column",
        imageUrl: images.collapseLeft,
      }),
    uncollapseColumnUrl &&
      h(TableCellToolsItem, {
        showOnHover: true,
        href: uncollapseColumnUrl,
        title: "Uncollapse this column",
        imageUrl: images.collapseRight,
      })
  );
};

export default TableCellTools;
