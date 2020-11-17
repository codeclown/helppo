import classNames from "classnames";
import { createElement as h, ReactElement } from "react";

export const ContainerRight = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  return h("div", { className: "ContainerRight" }, children);
};

const Container = ({
  verticalSlim,
  spaceInBetween,
  horizontal,
  children,
}: {
  verticalSlim?: boolean;
  spaceInBetween?: boolean;
  horizontal?: boolean;
  children?: ReactElement;
}): ReactElement => {
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
