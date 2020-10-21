import classNames from "classnames";
import { createElement as h } from "react";
import range from "../utils/range";

const Pagination = ({
  currentPage,
  totalPages,
  showPreviousNextButtons,
  onChange,
}) => {
  const showPages = 5;
  const visiblePages = range(
    Math.max(1, currentPage - Math.floor(showPages / 2)),
    Math.min(totalPages, currentPage + Math.floor(showPages / 2))
  );

  // TODO should be links, not buttons
  return h(
    "div",
    { className: "Pagination" },
    showPreviousNextButtons &&
      h(
        "button",
        {
          key: "previous",
          onClick: () => onChange(currentPage - 1),
          disabled: currentPage === 1,
        },
        "Previous"
      ),
    visiblePages[0] > 1 &&
      h(
        "button",
        {
          key: "beginning",
          disabled: true,
        },
        "…"
      ),
    visiblePages.map((pageNumber) =>
      h(
        "button",
        {
          key: pageNumber,
          onClick: () => onChange(pageNumber),
          className: classNames(pageNumber === currentPage && "active"),
        },
        pageNumber
      )
    ),
    visiblePages[visiblePages.length - 1] < totalPages &&
      h(
        "button",
        {
          key: "ending",
          disabled: true,
        },
        "…"
      ),
    showPreviousNextButtons &&
      h(
        "button",
        {
          key: "next",
          onClick: () => onChange(currentPage + 1),
          disabled: currentPage === totalPages,
        },
        "Next"
      )
  );
};

export default Pagination;
