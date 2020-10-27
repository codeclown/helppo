import classNames from "classnames";
import { createElement as h } from "react";

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
