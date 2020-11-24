import { createElement as h, Fragment, ReactElement } from "react";
import { HelppoTable } from "../../sharedTypes";
import Urls from "../Urls";
import BlockLinkList from "../components/BlockLinkList";
import Container from "../components/Container";
import HeadingBlock from "../components/HeadingBlock";
import niceifyName from "../utils/niceifyName";

interface WelcomeProps {
  urls: Urls;
  tables: HelppoTable[];
}

const Welcome = ({ urls, tables }: WelcomeProps): ReactElement => {
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
