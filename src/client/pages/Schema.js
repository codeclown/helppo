import { createElement as h, Fragment } from "react";
import CodeBlock from "../components/CodeBlock";
import Container from "../components/Container";

const Schema = ({ schema }) => {
  return h(
    Fragment,
    null,
    h(Container, null, "This is the currently active schema configuration:"),
    h(CodeBlock, { copyBadge: true }, JSON.stringify(schema, null, 2))
  );
};

export default Schema;
