import { createElement as h } from "react";
import { shallow } from "enzyme";
import { MemoryRouter as Router } from "react-router-dom";
import { expect } from "chai";
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

  it("renders config notice", async () => {
    const configNoticePromise = Promise.resolve({
      suggestedFreshSchema: {
        tables: [
          {
            name: "foobar",
            columns: [],
          },
        ],
      },
    });
    const getSchemaPromise = Promise.resolve({
      tables: [],
    });
    const getColumnTypesPromise = Promise.resolve([]);
    const getFilterTypesPromise = Promise.resolve([]);
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
    await Promise.all([
      configNoticePromise,
      getSchemaPromise,
      getColumnTypesPromise,
    ]);
    expect(wrapper.debug({ verbose: true })).to.equal(
      `<ConfigNotice suggestedFreshSchema={{ tables: [ { name: 'foobar', columns: [] } ] }} />`
    );
  });
});
