import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";
import { createElement as h } from "react";
import { StaticRouter as Router } from "react-router-dom";
import { useDom, doneWithDom, Screen } from "../../../test/domSetup";
import Navigation from "./Navigation";

let screen: Screen;

function getTopLevelItem(text: string): HTMLAnchorElement {
  const span = screen.getByText(text) as HTMLSpanElement;
  return span.parentNode as HTMLAnchorElement;
}

function getDropdownToggle(text: string): HTMLButtonElement {
  const span = screen.getByText(text) as HTMLSpanElement;
  return span.parentNode as HTMLButtonElement;
}

function getDropdownItem(text: string): HTMLAnchorElement {
  return screen.getByText(text) as HTMLAnchorElement;
}

describe("Navigation", () => {
  beforeEach(() => (screen = useDom()));
  after(() => doneWithDom());

  it("renders without props", () => {
    render(h(Router, null, h(Navigation)));
    expect(document.querySelector(".Navigation")).to.not.equal(null);
    expect(document.querySelector(".Navigation").outerHTML).to.equal(
      '<div class="Navigation"></div>'
    );
  });

  it("renders top-level links", () => {
    render(
      h(
        Router,
        null,
        h(Navigation, {
          linkGroups: [
            {
              icon: "icon.png",
              links: [
                { text: "Link 1", url: "/link-1" },
                { text: "Link 2", url: "/link-2" },
              ],
            },
          ],
        })
      )
    );

    const link1 = getTopLevelItem("Link 1");
    expect(link1.href).to.equal("/link-1");
    expect(link1.querySelector("img").src).to.equal("icon.png");

    const link2 = getTopLevelItem("Link 2");
    expect(link2.href).to.equal("/link-2");
    expect(link2.querySelector("img").src).to.equal("icon.png");
  });

  it("renders dropdown if dropdownTitle is set", () => {
    render(
      h(
        Router,
        null,
        h(Navigation, {
          linkGroups: [
            {
              dropdownTitle: "Link List",
              icon: "icon.png",
              links: [
                { text: "Link 1", url: "/link-1" },
                { text: "Link 2", url: "/link-2" },
              ],
            },
          ],
        })
      )
    );

    const toggle = getDropdownToggle("Link List");
    expect(toggle.querySelector("img").src).to.equal("icon.png");

    const link1 = getDropdownItem("Link 1");
    expect(link1.href).to.equal("/link-1");
    expect(link1.querySelector("img")).to.equal(null);

    const link2 = getDropdownItem("Link 2");
    expect(link2.href).to.equal("/link-2");
    expect(link2.querySelector("img")).to.equal(null);
  });

  it("shows/hides dropdown on hover/unhover", async () => {
    render(
      h(
        Router,
        null,
        h(Navigation, {
          linkGroups: [
            {
              dropdownTitle: "Link List",
              icon: "icon.png",
              links: [{ text: "Link 1", url: "/link-1" }],
            },
          ],
        })
      )
    );

    const dropdown = document.querySelector(".Navigation-dropdown");
    const isVisible = (): boolean =>
      dropdown.classList.contains("Navigation-dropdown--open");

    expect(isVisible()).to.equal(false);
    userEvent.hover(dropdown);
    expect(isVisible()).to.equal(true);
    userEvent.unhover(dropdown);
    expect(isVisible()).to.equal(false);
  });

  it("is accessible and shows/hides dropdown on focus/blur", async () => {
    render(
      h(
        Router,
        null,
        h(Navigation, {
          linkGroups: [
            {
              dropdownTitle: "Link List",
              icon: "icon.png",
              links: [{ text: "Link 1", url: "/link-1" }],
            },
          ],
        })
      )
    );

    const dropdown = document.querySelector(".Navigation-dropdown");
    const isVisible = (): boolean =>
      dropdown.classList.contains("Navigation-dropdown--open");
    const dropdownToggle = getDropdownToggle("Link List");
    const dropdownItem = getDropdownItem("Link 1");

    expect(isVisible()).to.equal(false);

    userEvent.tab();
    expect(document.activeElement).to.equal(dropdownToggle);
    expect(isVisible()).to.equal(true);

    userEvent.tab();
    expect(document.activeElement).to.equal(dropdownItem);
    expect(isVisible()).to.equal(true);

    userEvent.tab();
    expect(isVisible()).to.equal(false);
  });

  it("hides dropdown on esc key", async () => {
    render(
      h(
        Router,
        null,
        h(Navigation, {
          linkGroups: [
            {
              dropdownTitle: "Link List",
              icon: "icon.png",
              links: [{ text: "Link 1", url: "/link-1" }],
            },
          ],
        })
      )
    );

    const dropdown = document.querySelector(".Navigation-dropdown");
    const isVisible = (): boolean =>
      dropdown.classList.contains("Navigation-dropdown--open");

    userEvent.tab();
    expect(isVisible()).to.equal(true);

    fireEvent.keyDown(document.activeElement, { key: "Escape" });
    expect(isVisible()).to.equal(false);
  });
});
