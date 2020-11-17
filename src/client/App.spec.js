import { expect } from "chai";
import { shallow } from "enzyme";
import { createElement as h } from "react";
import { MemoryRouter as Router } from "react-router-dom";
import App from "./App";

describe("App", () => {
  it("starts with a loading state", () => {
    const configNoticePromise = new Promise(() => {});
    const getSchemaPromise = new Promise(() => {});
    const getColumnTypesPromise = new Promise(() => {});
    const getFilterTypesPromise = new Promise(() => {});
    const wrapper = shallow(
      h(App, {
        Router,
        api: {
          getConfigNotice: () => configNoticePromise,
          getSchema: () => getSchemaPromise,
          getColumnTypes: () => getColumnTypesPromise,
          getFilterTypes: () => getFilterTypesPromise,
        },
        mountpath: "/",
      })
    );
    expect(wrapper.debug({ verbose: true })).to.equal(`<MemoryRouter>
  <Navigation />
</MemoryRouter>`);
  });
});
