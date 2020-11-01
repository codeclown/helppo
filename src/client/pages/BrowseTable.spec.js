import { expect } from "chai";
import { shallow } from "enzyme";
import { createElement as h } from "react";
import { Redirect } from "react-router-dom";
import Filters from "../components/Filters";
import LoadingSpinner from "../components/LoadingSpinner";
import Table from "../components/Table";
import TableCellTools from "../components/TableCellTools";
import BrowseTable, { ColumnTitle } from "./BrowseTable";

const baseProps = {
  locationKey: "",
  api: {},
  urls: {
    editRowUrl: (...args) => `editRowUrl(${JSON.stringify(args)})`,
    browseTableUrl: (...args) => `browseTableUrl(${JSON.stringify(args)})`,
  },
  images: {},
  columnTypeComponents: {},
  filterTypes: [
    {
      key: "equals",
      name: "equals",
      columnTypes: ["integer", "string", "text", "date", "datetime"],
    },
    {
      key: "notEquals",
      name: "does not equal",
      columnTypes: ["integer", "string", "text", "date", "datetime"],
    },
  ],
  catchApiError: () => {},
  showNotification: () => {},
  rememberDeletedRow: () => {},
  table: {
    name: "test_table",
    primaryKey: "id",
    columns: [
      {
        name: "id",
        type: "integer",
      },
      {
        name: "name",
        type: "string",
      },
    ],
  },
  relations: [],
  browseOptions: {
    perPage: 20,
    currentPage: 1,
    filters: [],
    wildcardSearch: "",
  },
  presentationOptions: {
    collapsedColumns: [],
  },
};

describe("BrowseTable", () => {
  it("renders", () => {
    const wrapper = shallow(h(BrowseTable, { ...baseProps }));
    expect(wrapper.debug()).to.equal(`<div>
  <PageTitle>
    Test Table
  </PageTitle>
  <HeadingBlock level={2}>
    Test Table
  </HeadingBlock>
  <Container horizontal={true}>
    <ForwardRef style="success" to="editRowUrl([{"name":"test_table","primaryKey":"id","columns":[{"name":"id","type":"integer"},{"name":"name","type":"string"}]}])">
      Create
    </ForwardRef>
    <ContainerRight>
      <ForwardRef placeholder="Search…" size={24} value="" onChange={[Function: onChange]} />
    </ContainerRight>
  </Container>
  <Container>
    <Filters filterTypes={{...}} filters={{...}} columns={{...}} onChange={[Function: onChange]}>
      Create
    </Filters>
  </Container>
  <Table columnTitles={{...}} rows={{...}} blankSlateContent={{...}} columnWidths={{...}} />
  <Container>
    <LayoutColumns justifyEvenly={true} centerVertically={true}>
      <TotalResults>
        Total results: Unknown
      </TotalResults>
      <span>
        ${" "}
        <ForwardRef slim={true} options={{...}} value={20} onChange={[Function: onChange]} />
      </span>
    </LayoutColumns>
  </Container>
</div>`);
  });

  describe("usage of Filters", () => {
    it("passes props to Filters", () => {
      const wrapper = shallow(h(BrowseTable, { ...baseProps }));
      expect(wrapper.find(Filters).props().columns).to.deep.equal(
        baseProps.table.columns
      );
      expect(wrapper.find(Filters).props().filterTypes).to.deep.equal(
        baseProps.filterTypes
      );
      expect(wrapper.find(Filters).props().filters).to.deep.equal([]);
    });

    it("passes existing filters to Filters", () => {
      const wrapper = shallow(
        h(BrowseTable, {
          ...baseProps,
          browseOptions: {
            ...baseProps.browseOptions,
            filters: [
              {
                type: "equals",
                columnName: "name",
                value: "test",
              },
            ],
          },
        })
      );
      expect(wrapper.find(Filters).props().filters).to.deep.equal([
        {
          type: "equals",
          columnName: "name",
          value: "test",
        },
      ]);
    });

    it("redirects when Filters calls onChange", () => {
      const wrapper = shallow(h(BrowseTable, { ...baseProps }));
      const { onChange } = wrapper.find(Filters).props();
      onChange([
        {
          type: "equals",
          columnName: "name",
          value: "test",
        },
      ]);
      expect(wrapper.find(Redirect));
      expect(wrapper.find(Redirect).props()).to.deep.equal({
        push: true,
        to:
          'browseTableUrl(["test_table",{"perPage":20,"currentPage":1,"filters":[{"type":"equals","columnName":"name","value":"test"}],"wildcardSearch":""},{"collapsedColumns":[]}])',
      });
    });
  });

  describe("usage of Table", () => {
    it("passes columnTitles to Table", () => {
      const wrapper = shallow(h(BrowseTable, { ...baseProps }));
      expect(wrapper.find(Table).props().columnTitles).to.have.length(4);
      expect(wrapper.find(Table).props().columnTitles[0]).to.equal(false);
      expect(wrapper.find(Table).props().columnTitles[1].type).to.equal(
        ColumnTitle
      );
      expect(wrapper.find(Table).props().columnTitles[2].type).to.equal(
        ColumnTitle
      );
      expect(wrapper.find(Table).props().columnTitles[3]).to.equal("Relations");

      const columnTitle1 = wrapper.find(Table).props().columnTitles[1];
      expect(columnTitle1.props.images).to.equal(baseProps.images);
      expect(columnTitle1.props.table).to.equal(baseProps.table);
      expect(columnTitle1.props.urls).to.equal(baseProps.urls);
      expect(columnTitle1.props.browseOptions).to.equal(
        baseProps.browseOptions
      );
      expect(columnTitle1.props.column).to.equal(baseProps.table.columns[0]);
      expect(columnTitle1.props.presentationOptions).to.equal(
        baseProps.presentationOptions
      );

      const columnTitle2 = wrapper.find(Table).props().columnTitles[2];
      expect(columnTitle2.props.images).to.equal(baseProps.images);
      expect(columnTitle2.props.table).to.equal(baseProps.table);
      expect(columnTitle2.props.urls).to.equal(baseProps.urls);
      expect(columnTitle2.props.browseOptions).to.equal(
        baseProps.browseOptions
      );
      expect(columnTitle2.props.column).to.equal(baseProps.table.columns[1]);
      expect(columnTitle2.props.presentationOptions).to.equal(
        baseProps.presentationOptions
      );
    });

    it("passes rows to Table", () => {
      const wrapper = shallow(h(BrowseTable, { ...baseProps }));
      expect(wrapper.find(Table).props().rows).to.deep.equal([]);
    });

    it("passes blankSlateContent to Table", () => {
      const wrapper = shallow(h(BrowseTable, { ...baseProps }));
      expect(wrapper.find(Table).props().blankSlateContent.type).to.equal(
        LoadingSpinner
      );
    });

    it("passes columnWidths to Table", () => {
      const wrapper = shallow(h(BrowseTable, { ...baseProps }));
      expect(wrapper.find(Table).props().columnWidths).to.deep.equal([
        30,
        "auto",
        "auto",
        "auto",
      ]);
    });
  });

  describe("wildcard search state", () => {
    it("renders empty input", () => {
      const wrapper = shallow(h(BrowseTable, { ...baseProps }));
      const input = wrapper.find("[placeholder='Search…']");
      expect(input);
      expect(input.props().value).to.equal("");
    });

    it("renders input with initial value", () => {
      const wrapper = shallow(
        h(BrowseTable, {
          ...baseProps,
          browseOptions: {
            ...baseProps.browseOptions,
            wildcardSearch: "foobar",
          },
        })
      );
      const input = wrapper.find("[placeholder='Search…']");
      expect(input.props().value).to.equal("foobar");
    });

    it("updates value but debounces and only then updates query", () => {
      let callback;
      const mockDebounce = (fn, timeout) => {
        expect(timeout).to.equal(500);
        callback = fn;
        return () => {};
      };
      const wrapper = shallow(
        h(BrowseTable, {
          ...baseProps,
          debounce: mockDebounce,
        })
      );
      const { onChange } = wrapper.find("[placeholder='Search…']").props();
      onChange("test 123");
      expect(wrapper.find("[placeholder='Search…']").props().value).to.equal(
        "test 123"
      );
      expect(wrapper.find(Redirect)).to.have.length(0);
      callback("test 123");
      expect(wrapper.find(Redirect)).to.have.length(1);
      expect(wrapper.find(Redirect).props().to).to.equal(
        'browseTableUrl(["test_table",{"perPage":20,"currentPage":1,"filters":[],"wildcardSearch":"test 123"},{"collapsedColumns":[]}])'
      );
    });
  });
});

describe("ColumnTitle", () => {
  it("renders primary key with tools", () => {
    const wrapper = shallow(
      h(ColumnTitle, {
        ...baseProps,
        column: baseProps.table.columns[0],
      })
    );
    expect(wrapper.children()).to.have.length(2);
    expect(wrapper.childAt(0).debug()).to.equal(`<span>
  ID
</span>`);
    const tools = wrapper.childAt(1);
    expect(tools.type()).to.equal(TableCellTools);
    expect(tools.props().isPrimaryKey).to.equal(true);
    expect(tools.props().collapseColumnUrl).to.equal(
      'browseTableUrl(["test_table",{"perPage":20,"currentPage":1,"filters":[],"wildcardSearch":""},{"collapsedColumns":["id"]}])'
    );
    expect(tools.props().sortedAsc).to.equal(false);
    expect(tools.props().sortAscUrl).to.equal(
      'browseTableUrl(["test_table",{"perPage":20,"currentPage":1,"filters":[],"wildcardSearch":"","orderByColumn":"id","orderByDirection":"asc"},{"collapsedColumns":[]}])'
    );
    expect(tools.props().sortedDesc).to.equal(false);
    expect(tools.props().sortDescUrl).to.equal(
      'browseTableUrl(["test_table",{"perPage":20,"currentPage":1,"filters":[],"wildcardSearch":"","orderByColumn":"id","orderByDirection":"desc"},{"collapsedColumns":[]}])'
    );
    expect(tools.props().columnComment).to.equal(undefined);
  });

  it("renders non primary key", () => {
    const wrapper = shallow(
      h(ColumnTitle, {
        ...baseProps,
        column: baseProps.table.columns[1],
      })
    );
    expect(wrapper.children()).to.have.length(2);
    expect(wrapper.childAt(0).debug()).to.equal(`<span>
  Name
</span>`);
    const tools = wrapper.childAt(1);
    expect(tools.type()).to.equal(TableCellTools);
    expect(tools.props().isPrimaryKey).to.equal(false);
  });
});
