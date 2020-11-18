import ClipboardJS from "clipboard";
import {
  createElement as h,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import Button, { ButtonProps } from "./Button";

const CopyToClipboardButton = ({
  onCopy,
  children,
  ...props
}: ButtonProps & {
  onCopy: () => string;
  children?: ReactElement;
}): ReactElement => {
  const [clipboard, setClipboard] = useState(null);
  const buttonRef = useCallback(
    (buttonElement: Element) => {
      if (!clipboard) {
        setClipboard(
          new ClipboardJS(buttonElement, {
            container: buttonElement,
            text: onCopy,
          })
        );
      }
    },
    [clipboard, onCopy]
  );
  useEffect(() => {
    return () => {
      if (clipboard) {
        clipboard.destroy();
      }
    };
  }, [clipboard]);
  return h(
    Button,
    {
      ...props,
      ref: buttonRef,
    },
    children
  );
};

export default CopyToClipboardButton;
