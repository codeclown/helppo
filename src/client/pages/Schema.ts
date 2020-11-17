import { createElement as h, Fragment, ReactElement } from "react";
import { HelppoSchema } from "../../sharedTypes";
import CodeBlock from "../components/CodeBlock";
import Container from "../components/Container";

interface SchemaProps {
  schema: HelppoSchema;
}

const Schema = ({ schema }: SchemaProps): ReactElement => {
  return h(
    Fragment,
    null,
    h(Container, null, "This is the currently active schema configuration:"),
    h(CodeBlock, { copyBadge: true }, JSON.stringify(schema, null, 2))
  );
};

export default Schema;
