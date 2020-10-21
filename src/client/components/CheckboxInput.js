import { createElement as h } from "react";
import classNames from "classnames";

const CheckboxInput = ({ checked, radio, onChange, children }) => {
  return h(
    "label",
    {
      className: classNames("CheckboxInput", radio && "CheckboxInput--radio"),
    },
    h("input", {
      type: radio ? "radio" : "checkbox",
      checked,
      onChange: (event) => onChange(event.target.checked),
    }),
    h("span", { className: "input" }),
    children
  );
};

export default CheckboxInput;
