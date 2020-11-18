import { expect } from "chai";
import { shallow } from "enzyme";
import { createElement as h } from "react";
import { StaticRouter as Router } from "react-router-dom";
import Navigation from "./Navigation";

describe("Navigation", () => {
  it("renders without props", () => {
    const wrapper = shallow(h(Router, null, h(Navigation)));
    expect(wrapper.html()).to.equal(`<div class="Navigation"></div>`);
  });
});
