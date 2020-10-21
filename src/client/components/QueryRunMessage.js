import classNames from "classnames";
import { createElement as h } from "react";

const QueryRunMessage = ({ danger, children }) => {
  return h(
    "span",
    {
      className: classNames(
        "QueryRunMessage",
        danger && "QueryRunMessage--danger"
      ),
    },
    children
  );
};

export default QueryRunMessage;
