import { createElement as h, Fragment, useState } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { Link } from "react-router-dom";

const TableCellToolsItem = ({
  href,
  imageUrl,
  title,
  showOnHover,
  children,
  dropdownContainer,
}) => {
  const icon = h("img", { src: imageUrl });

  // This component does too many things

  // Dropdown-specific
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
  const [dropdownListX, setDropdownListX] = useState(0);
  const [dropdownListY, setDropdownListY] = useState(0);

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
      icon,
      children
    );
  }

  if (Array.isArray(children)) {
    return h(
      Fragment,
      null,
      h(
        "button",
        {
          className: classNames(
            "TableCellTools__item",
            "TableCellTools__item--clickable",
            !dropdownIsOpen &&
              showOnHover &&
              "TableCellTools__item--show-on-hover"
          ),
          title,
          onClick: (event) => {
            if (!dropdownIsOpen) {
              const close = () => {
                // Allow a frame for underlying link to be clicked
                setTimeout(() => {
                  setDropdownIsOpen(false);
                });
                document.removeEventListener("mouseup", close);
              };
              document.addEventListener("mouseup", close);
              setDropdownIsOpen(true);
              // Float on the right side
              setDropdownListX(event.target.getBoundingClientRect().left + 40);
              setDropdownListY(event.target.getBoundingClientRect().top - 20);
            }
          },
        },
        icon
      ),
      dropdownIsOpen &&
        createPortal(
          h(
            "span",
            {
              className: "TableCellTools__dropdown-list",
              style: {
                left: dropdownListX,
                top: dropdownListY,
              },
            },
            children
          ),
          dropdownContainer
        )
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
  filterUrls,
  dropdownContainer,
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
    filterUrls &&
      filterUrls.length > 0 &&
      h(
        TableCellToolsItem,
        {
          showOnHover: true,
          title: "Add this value as a filter",
          imageUrl: images.magnifierArrow,
          dropdownContainer,
        },
        filterUrls.map(({ name, url }) =>
          h(
            TableCellToolsItem,
            {
              key: url,
              href: url,
              title: `Add filter: ${name}`,
              imageUrl: images.magnifierPlus,
            },
            name
          )
        )
      ),
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
