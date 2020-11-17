import classNames from "classnames";
import Clipboard from "clipboard";
import {
  createElement as h,
  Component,
  createRef,
  RefObject,
  ReactElement,
} from "react";

interface CopyBadgeProps {
  text: string;
}

class CopyBadge extends Component<CopyBadgeProps> {
  buttonRef: RefObject<HTMLButtonElement>;
  clipboard: Clipboard;

  constructor(props: CopyBadgeProps) {
    super(props);
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

const ResizeHandle = ({ height, onResize }): ReactElement => {
  return h("div", {
    className: "CodeBlock__resizeHandle",
    onMouseDown: (event: MouseEvent) => {
      const beginY = event.clientY;
      const onMouseMove = (event) => {
        onResize(height + event.clientY - beginY);
      };
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
  });
};

const CodeBlock = ({
  editable,
  minHeight,
  maxHeight,
  height,
  copyBadge,
  children,
  wrapLines,
  placeholder,
  onChange,
  onKeyDown,
  onResize,
  resizable,
}: {
  editable?: boolean;
  minHeight?: number;
  maxHeight?: number;
  height?: number;
  copyBadge?: boolean;
  children?: string;
  wrapLines?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onResize?: (height: number) => void;
  resizable?: boolean;
}): ReactElement => {
  return h(
    "div",
    {
      className: classNames(
        "CodeBlock",
        wrapLines && "CodeBlock--wrapLines",
        resizable && "CodeBlock--resizable"
      ),
    },
    h(
      editable ? "textarea" : "div",
      {
        className: "CodeBlock__content",
        style: {
          minHeight: minHeight || "0",
          maxHeight: maxHeight || "auto",
          height: height || "auto",
        },
        placeholder,
        onChange: (event) => {
          onChange(event.target.value);
        },
        onKeyDown,
        value: editable ? children : "",
      },
      editable ? null : children
    ),
    copyBadge && h(CopyBadge, { text: children }),
    resizable &&
      h(ResizeHandle, {
        height,
        onResize: (newHeight) => {
          onResize(
            Math.max(minHeight || 0, Math.min(maxHeight || Infinity, newHeight))
          );
        },
      })
  );
};

export default CodeBlock;
