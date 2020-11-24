import classNames from "classnames";
import { createElement as h, ReactElement } from "react";

const LayoutColumns = ({
  justifyEvenly,
  centerVertically,
  children,
}: {
  justifyEvenly?: boolean;
  centerVertically?: boolean;
  children?: ReactElement;
}): ReactElement => {
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
