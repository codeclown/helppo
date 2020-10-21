import { createElement as h, useRef } from "react";
import { calendar } from "../images";

const dateRegex = /\d{4}-\d{2}-\d{2}/;

const DatePicker = ({ value, onChange }) => {
  const inputRef = useRef(null);
  const dateStringMatch = typeof value === "string" && value.match(dateRegex);
  const dateString = dateStringMatch ? dateStringMatch[0] : "";
  return h(
    "div",
    { className: "DatePicker" },
    h("img", { className: "DatePicker__icon", src: calendar }),
    h("input", {
      ref: inputRef,
      className: "DatePicker__input",
      type: "date",
      value: dateString,
      onChange: (event) => {
        const dateString = event.target.value;
        if (dateStringMatch) {
          const newValue = value.replace(dateRegex, dateString);
          onChange(newValue);
        } else {
          onChange(dateString);
        }
      },
    })
  );
};

export default DatePicker;
