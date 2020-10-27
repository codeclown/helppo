import { createElement as h, Component, Fragment } from "react";
import Button, { ButtonStyles } from "./Button";
import CodeBlock from "./CodeBlock";
import Container from "./Container";

class ErrorModal extends Component {
  render() {
    if (!this.props.error) {
      return null;
    }

    let responseBody = this.props.error.response.body;
    try {
      responseBody = JSON.parse(responseBody);
      responseBody = JSON.stringify(responseBody, null, 2);
    } catch (error) {
      // Do nothing
    }

    return h(
      "div",
      { className: "ErrorModal" },
      h(
        "div",
        { className: "modal" },
        h(Container, null, "An unexpected error occurred:"),
        h(CodeBlock, null, this.props.error.toString()),
        this.props.error.response &&
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
              onClick: this.props.close,
              style: ButtonStyles.GHOST,
            },
            "Close"
          )
        )
      )
    );
  }
}

export default ErrorModal;
