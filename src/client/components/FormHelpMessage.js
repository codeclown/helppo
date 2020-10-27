import classNames from "classnames";
import { createElement as h } from "react";

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
