import classNames from "classnames";
import { createElement as h } from "react";

const Container = ({ verticalSlim, spaceInBetween, children }) => {
  return h(
    "div",
    {
      className: classNames(
        "Container",
        verticalSlim && "Container--verticalSlim",
        spaceInBetween && "Container--spaceInBetween"
      ),
    },
    children
  );
};

export default Container;
