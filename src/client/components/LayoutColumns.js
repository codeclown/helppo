import classNames from "classnames";
import { createElement as h } from "react";

const LayoutColumns = ({ justifyEvenly, centerVertically, children }) => {
  return h(
    "div",
    {
      className: classNames(
        "LayoutColumns",
        justifyEvenly && "LayoutColumns--justifyEvenly",
        centerVertically && "LayoutColumns--centerVertically"
      ),
    },
    children
  );
};

export default LayoutColumns;
