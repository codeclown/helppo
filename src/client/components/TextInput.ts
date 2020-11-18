import classNames from "classnames";
import {
  createElement as h,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  ReactElement,
} from "react";

const TextInput = forwardRef(
  (
    {
      value,
      type = "text",
      disabled,
      placeholder,
      slim,
      size,
      multiLine,
      textAlignCenter,
      danger,
      onChange,
      onBlur,
      autoFocus,
      ...rest
    }: {
      value: string;
      type?: "text" | "password";
      disabled?: boolean;
      placeholder?: string;
      slim?: boolean;
      size?: number;
      multiLine?: boolean;
      textAlignCenter?: boolean;
      danger?: boolean;
      onChange?: (value: string) => void;
      onBlur?: (value: string) => void;
      autoFocus?: boolean;
    },
    ref
  ): ReactElement => {
    const tagName = multiLine ? "textarea" : "input";
    const props: Partial<InputHTMLAttributes<HTMLInputElement>> & {
      ref: ForwardedRef<unknown>;
    } = {
      className: classNames(
        "TextInput",
        slim && "TextInput--slim",
        multiLine && "TextInput--multiLine",
        textAlignCenter && "TextInput--textAlignCenter",
        danger && "TextInput--danger"
      ),
      disabled,
      autoFocus,
      defaultValue: value,
      placeholder: placeholder || "",
      type,
      ...rest,
      ref,
    };

    if (onChange) {
      delete props.defaultValue;
      props.value = value;
      props.onChange = (event) => {
        onChange(event.target.value);
      };
    }

    if (onBlur) {
      props.onBlur = (event) => {
        onBlur(event.target.value);
      };
    }

    if (size) {
      const padding = 2 * (slim ? 4 : 8);
      props.style = {
        width: size * 8 + padding,
      };
    }
    return h(tagName, props);
  }
);

export default TextInput;
