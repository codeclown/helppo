import { createElement as h, Fragment } from "react";
import HeadingBlock from "../components/HeadingBlock";
import Container from "../components/Container";
import BlockLinkList from "../components/BlockLinkList";
import niceifyName from "../utils/niceifyName";
import { tableIndexUrl } from "../urls";

const Welcome = ({ tables }) => {
  return h(
    Fragment,
    null,
    h(HeadingBlock, { level: 1 }, "Welcome!"),
    h(
      Container,
      null,
      h(BlockLinkList, {
        items: tables.map((table) => {
          return {
            title: niceifyName(table.name),
            href: tableIndexUrl(table),
          };
        }),
      })
    )
  );
};

export default Welcome;
