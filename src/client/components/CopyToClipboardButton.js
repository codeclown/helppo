import ClipboardJS from "clipboard";
import { createElement as h, useEffect, useRef, useState } from "react";
import Button from "./Button";

const CopyToClipboardButton = ({ onCopy, children, ...props }) => {
  const buttonRef = useRef(null);
  const [clipboard, setClipboard] = useState(null);
  useEffect(() => {
    if (buttonRef.current) {
      setClipboard(
        new ClipboardJS(buttonRef.current, {
          container: buttonRef.current,
          text: onCopy,
        })
      );
      return () => {
        if (clipboard) {
          clipboard.destroy();
        }
      };
    }
  }, [buttonRef.current]);
  return h(
    Button,
    {
      ...props,
      ref: buttonRef,
      onClick: () => {},
    },
    children
  );
};

export default CopyToClipboardButton;
