import classNames from "classnames";
import { createElement as h, ReactElement } from "react";

const QueryRunMessage = ({
  danger,
  children,
}: {
  danger?: boolean;
  children?: ReactElement;
}): ReactElement => {
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
