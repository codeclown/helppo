import { createElement as h } from "react";

const HeadingBlock = ({ level, children }) => {
  const tagNames = {
    1: "h1",
    2: "h2",
  };

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
