import classNames from "classnames";
import {
  DOMAttributes,
  createElement as h,
  ReactElement,
  useState,
} from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

const TopLevelLink = ({
  icon,
  url,
  children,
  ...rest
}: {
  icon: string;
  url?: string;
  children?: ReactElement;
} & DOMAttributes<HTMLButtonElement>): ReactElement => {
  const className = classNames(
    "Navigation-link",
    url && "Navigation-link--clickable"
  );

  const content = [
    icon && h("img", { className: "Navigation-link-icon", src: icon }),
    h("span", null, children),
  ];

  if (url) {
    return h(
      NavLink,
      {
        className,
        to: url,
        activeClassName: "active",
      },
      ...content
    );
  }

  return h(
    "button",
    {
      className,
      ...rest,
    },
    ...content
  );
};

const DropdownLink = ({
  url,
  children,
  ...rest
}: {
  url: string;
  children?: ReactElement;
} & Partial<NavLinkProps>): ReactElement => {
  return h(
    NavLink,
    {
      className: classNames("Navigation-dropdown-link"),
      activeClassName: "active",
      to: url,
      ...rest,
    },
    children
  );
};

const Dropdown = ({ icon, title, links }): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  return h(
    "div",
    {
      className: classNames(
        "Navigation-dropdown",
        isOpen && "Navigation-dropdown--open"
      ),
      onBlur: (event: FocusEvent) => {
        const target = event.relatedTarget as HTMLDivElement;
        if (
          isOpen &&
          // Nasty
          !target.classList.contains("Navigation-dropdown-link")
        ) {
          setIsOpen(false);
        }
      },
      onKeyDown: (event) => {
        if (event.key === "Escape" && isOpen) {
          setIsOpen(false);
        }
      },
      onMouseEnter: () => {
        setIsOpen(true);
      },
      onMouseLeave: () => {
        setIsOpen(false);
      },
    },
    h(
      TopLevelLink,
      {
        icon,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            setIsOpen(!isOpen);
          }
        },
      },
      title
    ),
    h(
      "div",
      { className: "Navigation-dropdown-container" },
      links.map(({ separator, url, text }, index) =>
        separator
          ? h("div", { key: index, className: "Navigation-dropdown-separator" })
          : h(
              DropdownLink,
              {
                key: index,
                url,
                onClick: () => {
                  setIsOpen(false);
                },
              },
              text
            )
      )
    )
  );
};

const Navigation = ({
  linkGroups = [],
}: {
  linkGroups: {
    icon: string;
    dropdownTitle: string;
    links: { url: string; text: string; separator?: boolean }[];
  }[];
}): ReactElement => {
  return h(
    "div",
    { className: "Navigation" },
    linkGroups.map(({ icon, dropdownTitle, links }, index) => {
      if (dropdownTitle) {
        return h(Dropdown, {
          key: index,
          icon,
          title: dropdownTitle,
          links,
        });
      }
      return links.map(({ text, url }, index) =>
        h(
          TopLevelLink,
          {
            key: index,
            icon,
            url,
          },
          text
        )
      );
    })
  );
};

export default Navigation;
