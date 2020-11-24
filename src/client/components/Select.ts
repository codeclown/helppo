import classNames from "classnames";
import { createElement as h, forwardRef } from "react";

const Select = forwardRef(
  <T>(
    {
      options,
      value,
      placeholder,
      slim,
      onChange,
    }: {
      options: (T | { text: string; value: T; disabled?: boolean })[];
      value: T;
      placeholder?: string;
      slim?: boolean;
      onChange: (value: T) => void;
    },
    ref
  ) => {
    return h(
      "select",
      {
        ref,
        className: classNames("Select", slim && "Select--slim"),
        value,
        onChange: (event) => {
          let index = event.target.selectedIndex;
          if (placeholder) {
            index -= 1;
          }
          const option = options[index];
          const value = "value" in option ? option.value : option;
          onChange(value);
        },
      },
      placeholder &&
        h(
          "option",
          {
            key: "placeholder",
            value: "",
            disabled: true,
          },
          placeholder
        ),
      options.map((option, index) => {
        const text = "text" in option ? option.text : option.toString();
        const value = "text" in option ? option.value : option.toString();
        const disabled = "disabled" in option ? option.disabled : false;
        return h(
          "option",
          {
            key: index,
            value,
            disabled,
          },
          text
        );
      })
    );
  }
);

export default Select;
