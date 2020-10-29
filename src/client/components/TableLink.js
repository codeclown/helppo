import classNames from "classnames";
import { createElement as h } from "react";
import { Link } from "react-router-dom";

export const TableLinkStyles = {
  DEFAULT: "default",
  ROUNDED: "rounded",
};

const TableLink = ({
  className,
  style = TableLinkStyles.DEFAULT,
  tiny,
  children,
  ...props
}) => {
  return h(
    props.to ? Link : "button",
    {
      className: classNames(
        "TableLink",
        className,
        tiny && "TableLink--tiny",
        style && `TableLink--${style}`
      ),
      ...props,
    },
    children
  );
};

export default TableLink;
