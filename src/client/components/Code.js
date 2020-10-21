import classNames from "classnames";
import { createElement as h } from "react";

const Code = ({ hasBackground, insideLink, children }) => {
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
