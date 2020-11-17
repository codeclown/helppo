import classNames from "classnames";
import { createElement as h, ReactElement } from "react";

const Code = ({
  hasBackground,
  insideLink,
  children,
}: {
  hasBackground?: boolean;
  insideLink?: boolean;
  children: ReactElement;
}): ReactElement => {
  return h(
    "span",
    {
      className: classNames(
        "Code",
        hasBackground && "Code--hasBackground",
        insideLink && "Code--insideLink"
      ),
    },
    children
  );
};

export default Code;
