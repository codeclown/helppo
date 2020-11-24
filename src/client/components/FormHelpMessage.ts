import classNames from "classnames";
import { createElement as h, ReactElement } from "react";

const FormHelpMessage = ({
  danger,
  children,
}: {
  danger?: boolean;
  children: ReactElement;
}): ReactElement => {
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
