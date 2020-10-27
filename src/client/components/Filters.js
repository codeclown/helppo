import { createElement as h, Component, createRef } from "react";
import niceifyName from "../utils/niceifyName";
import Button, { ButtonStyles } from "./Button";
import Select from "./Select";
import TextInput from "./TextInput";

class Filters extends Component {
  constructor(props) {
    super();

    this.state = {
      dirtyFilters: props.filters.map((filter) => Object.assign({}, filter)),
    };

    this.lastColumnSelectRef = createRef();

    this.getFirstCompatibleFilterType = this.getFirstCompatibleFilterType.bind(
      this
    );
    this.addFilter = this.addFilter.bind(this);
    this.clearAllFilters = this.clearAllFilters.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.dirtyFilters.length > prevState.dirtyFilters.length) {
      const lastColumnSelect = this.lastColumnSelectRef.current;
      if (lastColumnSelect) {
        lastColumnSelect.focus();
      }
    }
  }

  getFirstCompatibleFilterType(column) {
    return this.props.filterTypes.find((filterType) => {
      return filterType.columnTypes.includes(column.type);
    });
  }

  getFilterTypeByKey(key) {
    return this.props.filterTypes.find((filterType) => {
      return filterType.key === key;
    });
  }

  getColumnByName(name) {
    return this.props.columns.find((column) => {
      return column.name === name;
    });
  }

  addFilter() {
    const firstColumn = this.props.columns[0];
    const firstCompatibleFilterType = this.getFirstCompatibleFilterType(
      firstColumn
    );
    this.setState({
      dirtyFilters: [
        ...this.state.dirtyFilters,
        {
          columnName: firstColumn.name,
          type: firstCompatibleFilterType.key,
          value: "",
        },
      ],
    });
  }

  clearAllFilters() {
    this.setState(() => ({
      dirtyFilters: [],
    }));
    setTimeout(this.onChange);
  }

  removeFilter(filter) {
    this.setState((state) => ({
      dirtyFilters: state.dirtyFilters.filter((item) => item !== filter),
    }));
  }

  updateFilter(filter, newColumn, newFilterType, newValue) {
    this.setState((state) => ({
      dirtyFilters: state.dirtyFilters.map((item) => {
        if (item === filter) {
          if (newColumn !== undefined) {
            const filterType = this.getFilterTypeByKey(item.type);
            const compatibleFilterType = filterType.columnTypes.includes(
              newColumn.type
            )
              ? filterType
              : this.getFirstCompatibleFilterType(newColumn);
            return {
              ...item,
              type: compatibleFilterType.key,
              columnName: newColumn.name,
            };
          }
          if (newFilterType !== undefined) {
            return {
              ...item,
              type: newFilterType.key,
            };
          }
          if (newValue !== undefined) {
            return {
              ...item,
              value: newValue,
            };
          }
          return item;
        }
        return item;
      }),
    }));
  }

  onChange() {
    this.props.onChange(this.state.dirtyFilters);
  }

  render() {
    return h(
      "form",
      { className: "Filters", onSubmit: this.onChange },
      h(
        "div",
        { className: "toolbar" },
        h(
          "button",
          {
            type: "button",
            className: "toolbar-button",
            onClick: this.addFilter,
          },
          "+ Add filter"
        ),
        this.state.dirtyFilters.length > 0 &&
          h(
            "button",
            {
              type: "button",
              className: "toolbar-button",
              onClick: this.clearAllFilters,
            },
            "Clear filters"
          ),
        h(
          "a",
          {
            className: "toolbar-button toolbar-button--right",
            title:
              "Link to this page, including currently active filters, presentation options such as collapsed columns, and current page number",
            href: window.location.toString(),
          },
          "Link to this page"
        )
      ),
      this.state.dirtyFilters.length > 0 &&
        h(
          "div",
          { className: "filter-boxes" },
          this.state.dirtyFilters.map((dirtyFilter, index) => {
            const { columnName, type, value } = dirtyFilter;
            const column = this.getColumnByName(columnName);
            const isLast = index === this.state.dirtyFilters.length - 1;
            return h(
              "div",
              {
                key: index,
                className: "filter-box",
              },
              h(Select, {
                slim: true,
                placeholder: "Column",
                ref: isLast && this.lastColumnSelectRef,
                options: this.props.columns
                  .filter((column) => {
                    return (
                      this.getFirstCompatibleFilterType(column) &&
                      !column.secret
                    );
                  })
                  .map((column) => {
                    return {
                      text: niceifyName(column.name),
                      value: column.name,
                    };
                  }),
                value: columnName,
                onChange: (value) => {
                  const newColumn = this.getColumnByName(value);
                  this.updateFilter(dirtyFilter, newColumn);
                },
              }),
              h(Select, {
                slim: true,
                options: this.props.filterTypes.map((filterType) => {
                  return {
                    text: filterType.name,
                    value: filterType.key,
                    disabled: !filterType.columnTypes.includes(column.type),
                  };
                }),
                value: type,
                onChange: (value) => {
                  const newFilterType = this.getFilterTypeByKey(value);
                  this.updateFilter(dirtyFilter, undefined, newFilterType);
                },
              }),
              h(TextInput, {
                slim: true,
                value,
                onChange: (newValue) =>
                  this.updateFilter(
                    dirtyFilter,
                    undefined,
                    undefined,
                    newValue
                  ),
              }),
              h(
                "button",
                {
                  type: "button",
                  className: "toolbar-button",
                  onClick: () =>
                    this.state.dirtyFilters.length === 1
                      ? this.clearAllFilters()
                      : this.removeFilter(dirtyFilter),
                },
                "Remove filter ×"
              )
            );
          }),
          h(
            "div",
            { key: "apply", className: "filter-box" },
            h(
              Button,
              {
                type: "submit",
                style:
                  JSON.stringify(this.state.dirtyFilters) ===
                  JSON.stringify(this.props.filters)
                    ? ButtonStyles.GHOST
                    : ButtonStyles.SUCCESS,
                slim: true,
              },
              "Apply"
            )
          )
        )
    );
  }
}

export default Filters;
