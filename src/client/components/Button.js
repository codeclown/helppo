import classNames from "classnames";
import { createElement as h, forwardRef } from "react";
import { Link } from "react-router-dom";

export const ButtonStyles = {
  SUCCESS: "success",
  DANGER: "danger",
  GHOST: "ghost",
  LINK: "link",
};

const Button = forwardRef(
  ({ to, type, onClick, style, slim, disabled, children }, ref) => {
    const className = classNames(
      "Button",
      `Button--${style}`,
      slim && "Button--slim"
    );
    if (to) {
      return h(Link, { ref, className, to }, children);
    }
    if (onClick) {
      return h(
        "button",
        { ref, className, type: "button", onClick, disabled },
        children
      );
    }
    return h(
      "button",
      { className, type: type || "button", disabled },
      children
    );
  }
);

export default Button;
