import classNames from "classnames";
import { createElement as h, useState } from "react";
import { NavLink } from "react-router-dom";

const TopLevelLink = ({ icon, url, children, ...rest }) => {
  let tagName = "button";
  const props = {
    className: classNames(
      "Navigation-link",
      url && "Navigation-link--clickable"
    ),
    to: url,
    ...rest,
  };
  if (url) {
    tagName = NavLink;
    props.activeClassName = "active";
  }
  return h(
    tagName,
    props,
    icon && h("img", { className: "Navigation-link-icon", src: icon }),
    h("span", null, children)
  );
};

const DropdownLink = ({ url, onClick, children }) => {
  return h(
    NavLink,
    {
      className: classNames("Navigation-dropdown-link"),
      activeClassName: "active",
      to: url,
      onClick,
    },
    children
  );
};

const Dropdown = ({ icon, title, links }) => {
  const [isOpen, setIsOpen] = useState(false);

  return h(
    "div",
    {
      className: classNames(
        "Navigation-dropdown",
        isOpen && "Navigation-dropdown--open"
      ),
      onBlur: (event) => {
        if (
          isOpen &&
          // Nasty
          !event.relatedTarget.classList.contains("Navigation-dropdown-link")
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

const Navigation = ({ linkGroups = [] }) => {
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
