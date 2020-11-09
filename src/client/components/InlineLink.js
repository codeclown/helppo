import classNames from "classnames";
import { createElement as h } from "react";
import { Link } from "react-router-dom";

const InlineLink = ({ children, ...props }) => {
  return h(
    props.to ? Link : "button",
    {
      className: classNames("InlineLink"),
      ...props,
    },
    children
  );
};

export default InlineLink;
