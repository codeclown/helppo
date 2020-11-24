import { createElement as h, ReactElement } from "react";

const tagNames = {
  1: "h1",
  2: "h2",
};

const HeadingBlock = ({
  level,
  children,
}: {
  level: keyof typeof tagNames;
  children?: ReactElement;
}): ReactElement => {
  const tagName = tagNames[level];

  if (!tagName) {
    throw new Error(`Level ${level} is not valid`);
  }

  return h(
    tagName,
    {
      className: "HeadingBlock",
    },
    children
  );
};

export default HeadingBlock;
