import classNames from "classnames";
import { createElement as h } from "react";

export const ContainerRight = ({ children }) => {
  return h("div", { className: "ContainerRight" }, children);
};

const Container = ({ verticalSlim, spaceInBetween, horizontal, children }) => {
  return h(
    "div",
    {
      className: classNames(
        "Container",
        verticalSlim && "Container--verticalSlim",
        spaceInBetween && "Container--spaceInBetween",
        horizontal && "Container--horizontal"
      ),
    },
    children
  );
};

export default Container;
