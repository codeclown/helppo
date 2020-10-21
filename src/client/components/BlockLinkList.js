import { createElement as h } from "react";
import { Link } from "react-router-dom";

const BlockLinkList = ({ items }) => {
  return h(
    "div",
    { className: "BlockLinkList" },
    items.map((item, index) =>
      h(
        Link,
        { key: index, to: item.href, className: "BlockLinkList__item" },
        h(
          "div",
          { className: "BlockLinkList__item-title", title: item.title },
          item.title
        )
      )
    )
  );
};

export default BlockLinkList;
