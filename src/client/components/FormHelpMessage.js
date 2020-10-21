import { createElement as h } from "react";
import classNames from "classnames";

const FormHelpMessage = ({ danger, children }) => {
  return h(
    "div",
    {
      className: classNames(
        "FormHelpMessage",
        danger && "FormHelpMessage--danger"
      ),
    },
    children
  );
};

export default FormHelpMessage;
