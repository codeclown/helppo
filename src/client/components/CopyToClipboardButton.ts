import ClipboardJS from "clipboard";
import {
  createElement as h,
  ReactElement,
  useEffect,
  useRef,
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
    },
    children
  );
};

export default CopyToClipboardButton;
