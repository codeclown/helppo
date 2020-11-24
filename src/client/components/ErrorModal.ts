import { createElement as h, Fragment, ReactElement } from "react";
import { YeaRequestError } from "yea";
import Button, { ButtonStyles } from "./Button";
import CodeBlock from "./CodeBlock";
import Container from "./Container";

const ErrorModal = ({
  error,
  close,
}: {
  error?: Error | YeaRequestError;
  close: () => void;
}): ReactElement => {
  if (!error) {
    return null;
  }

  let responseBody = "";
  if ("response" in error) {
    responseBody = error.response.body;
    try {
      responseBody = JSON.parse(responseBody);
      responseBody = JSON.stringify(responseBody, null, 2);
    } catch (error) {
      // Do nothing
    }
  }

  return h(
    "div",
    { className: "ErrorModal" },
    h(
      "div",
      { className: "modal" },
      h(Container, null, "An unexpected error occurred:"),
      h(CodeBlock, null, error.toString()),
      "response" in error &&
        h(
          Fragment,
          null,
          h(Container, null, "Information from server:"),
          h(
            CodeBlock,
            { wrapLines: true },
            responseBody === "" ? "(no information)" : responseBody
          )
        ),
      h(
        Container,
        null,
        h(
          Button,
          {
            onClick: close,
            style: ButtonStyles.GHOST,
          },
          "Close"
        )
      )
    )
  );
};

export default ErrorModal;
