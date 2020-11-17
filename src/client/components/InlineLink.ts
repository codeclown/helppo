import { createElement as h, ReactElement } from "react";
import { Link } from "react-router-dom";

const InlineLink = ({
  children,
  to,
  ...props
}: {
  children?: ReactElement;
  to: string;
}): ReactElement => {
  return h(
    to ? Link : "button",
    {
      className: "InlineLink",
      to,
      ...props,
    },
    children
  );
};

export default InlineLink;
