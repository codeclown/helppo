import classNames from "classnames";
import { createElement as h, forwardRef, ReactElement, Ref } from "react";
import { Link } from "react-router-dom";

export enum ButtonStyles {
  SUCCESS = "success",
  DANGER = "danger",
  GHOST = "ghost",
  LINK = "link",
}

export interface ButtonProps {
  to?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  style?: ButtonStyles;
  slim?: boolean;
  disabled?: boolean;
  children?: ReactElement;
}

const Button = forwardRef(
  (
    { to, type, onClick, style, slim, disabled, children }: ButtonProps,
    ref: Ref<HTMLAnchorElement>
  ): ReactElement => {
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
