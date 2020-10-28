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
  children,
  ...props
}) => {
  return h(
    props.to ? Link : "button",
    {
      className: classNames(
        "TableLink",
        className,
        style && `TableLink--${style}`
      ),
      ...props,
    },
    children
  );
};

export default TableLink;
