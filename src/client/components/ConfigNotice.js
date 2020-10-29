import { createElement as h } from "react";
import Code from "./Code";
import CodeBlock from "./CodeBlock";
import Container from "./Container";

const ConfigNotice = ({ suggestedFreshSchema }) => {
  if (suggestedFreshSchema) {
    return h(
      "div",
      { className: "ConfigNotice" },
      h(Container, null, "Welcome to Helppo!"),
      h(
        Container,
        null,
        "Your configuration lacks the ",
        h(Code, null, "schema"),
        " property. Here is an automatically generated one. Please review it before copying."
      ),
      h(
        CodeBlock,
        { maxHeight: 100, copyBadge: true },
        `schema: ${JSON.stringify(suggestedFreshSchema, null, 2)}`
      ),
      h(
        Container,
        null,
        "Or you can set it to ",
        h(Code, null, JSON.stringify("auto")),
        " if you are absolutely sure that making all tables and columns editable is OK for your application:"
      ),
      h(CodeBlock, null, `schema: ${JSON.stringify("auto")}`),
      h(
        Container,
        null,
        "When you’ve added the configuration and restarted the node process, refresh this page!"
      )
    );
  }

  return h("div");
};

export default ConfigNotice;
