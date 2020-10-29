import { createElement as h, Fragment } from "react";
import BlockLinkList from "../components/BlockLinkList";
import Container from "../components/Container";
import HeadingBlock from "../components/HeadingBlock";
import niceifyName from "../utils/niceifyName";

const Welcome = ({ urls, tables }) => {
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
            href: urls.tableIndexUrl(table),
          };
        }),
      })
    )
  );
};

export default Welcome;
