import { createElement as h } from "react";
import classNames from "classnames";

const Container = ({ verticalSlim = false, children }) => {
  return h(
    "div",
    {
      className: classNames(
        "Container",
        verticalSlim && "Container--verticalSlim"
      ),
    },
    children
  );
};

export default Container;
