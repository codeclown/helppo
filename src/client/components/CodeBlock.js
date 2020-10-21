import { createElement as h, Component, createRef } from "react";
import classNames from "classnames";
import Clipboard from "clipboard";

class CopyBadge extends Component {
  constructor() {
    super();
    this.buttonRef = createRef();
  }

  componentDidMount() {
    this.clipboard = new Clipboard(this.buttonRef.current, {
      text: () => this.props.text,
    });
  }

  render() {
    return h(
      "button",
      { ref: this.buttonRef, className: "CodeBlock__copyBadge" },
      "Copy"
    );
  }
}

const CodeBlock = ({
  editable,
  minHeight,
  maxHeight,
  copyBadge,
  children,
  wrapLines,
  placeholder,
  onChange,
  onKeyDown,
}) => {
  if (typeof children !== "string") {
    throw new Error("CodeBlock expects a string as children");
  }

  const props = {
    className: classNames("CodeBlock", wrapLines && "CodeBlock--wrapLines"),
    style: {
      minHeight: minHeight || "0",
      maxHeight: maxHeight || "auto",
    },
  };

  if (editable) {
    props.placeholder = placeholder;
    props.onChange = (event) => onChange(event.target.value);
    props.onKeyDown = onKeyDown;
    props.value = children;
    return h("textarea", props);
  }

  return h(
    "div",
    props,
    copyBadge && h(CopyBadge, { text: children }),
    children
  );
};

export default CodeBlock;
