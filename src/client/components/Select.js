import classNames from "classnames";
import { createElement as h, forwardRef } from "react";

const Select = forwardRef(
  ({ options, value, placeholder, slim, onChange }, ref) => {
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
          const value = typeof option === "object" ? option.value : option;
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
        const text =
          typeof option === "object" ? option.text : option.toString();
        const value =
          typeof option === "object" ? option.value : option.toString();
        const disabled = option.disabled;
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
