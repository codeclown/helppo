import classNames from "classnames";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  createElement as h,
  ReactElement,
} from "react";
import { Link } from "react-router-dom";

export enum TableLinkStyles {
  DEFAULT = "default",
  ROUNDED = "rounded",
}

const TableLink = ({
  className,
  to,
  style = TableLinkStyles.DEFAULT,
  tiny,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: string;
    style?: TableLinkStyles;
    tiny?: boolean;
  }): ReactElement => {
  return h(
    to ? Link : "button",
    {
      className: classNames(
        "TableLink",
        className,
        tiny && "TableLink--tiny",
        style && `TableLink--${style}`
      ),
      to,
      ...props,
    },
    children
  );
};

export default TableLink;
