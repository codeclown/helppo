import {
  createElement as h,
  useState,
  useRef,
  useCallback,
  ReactElement,
  useEffect,
} from "react";
import {
  BrowseFilter,
  FilterType,
  HelppoColumn,
  HelppoTable,
} from "../../sharedTypes";
import niceifyName from "../utils/niceifyName";
import Button, { ButtonStyles } from "./Button";
import Select from "./Select";
import TextInput from "./TextInput";

function matchTableColumn(
  tableName: string,
  columnName: string
): (item: FilterType["columnNames"][number]) => boolean {
  return (item: FilterType["columnNames"][number]) => {
    return item.tableName === tableName && item.columnName === columnName;
  };
}

function getFirstCompatibleFilterType(
  tableName: string,
  filterTypes: FilterType[],
  column: HelppoColumn
): FilterType {
  return filterTypes.find((filterType) => {
    return filterType.columnNames.some(
      matchTableColumn(tableName, column.name)
    );
  });
}

function getFilterTypeByKey(
  filterTypes: FilterType[],
  key: string
): FilterType {
  return filterTypes.find((filterType) => {
    return filterType.key === key;
  });
}

function getColumnByName(columns: HelppoColumn[], name: string): HelppoColumn {
  return columns.find((column) => {
    return column.name === name;
  });
}

const Filters = ({
  filters,
  filterTypes,
  table,
  onChange,
}: {
  filters: BrowseFilter[];
  filterTypes: FilterType[];
  table: HelppoTable;
  onChange: (filters: BrowseFilter[]) => void;
}): ReactElement => {
  const [dirtyFilters, setDirtyFilters] = useState<BrowseFilter[]>(() =>
    filters.map((filter) => ({ ...filter }))
  );
  const [focusLastSelect, setFocusLastSelect] = useState<boolean>(false);
  const lastColumnSelectRef = useRef<HTMLSelectElement>(null);

  const triggerOnChange = useCallback(() => {
    onChange(dirtyFilters);
  }, [onChange, dirtyFilters]);

  const addFilter = useCallback(() => {
    const firstColumn = table.columns[0];
    const firstCompatibleFilterType = getFirstCompatibleFilterType(
      table.name,
      filterTypes,
      firstColumn
    );
    setDirtyFilters([
      ...dirtyFilters,
      {
        columnName: firstColumn.name,
        type: firstCompatibleFilterType.key,
        value: "",
      },
    ]);
    setFocusLastSelect(true);
  }, [table, dirtyFilters, filterTypes]);

  const clearAllFilters = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const removeFilter = useCallback(
    (filter: BrowseFilter) => {
      setDirtyFilters(dirtyFilters.filter((item) => item !== filter));
    },
    [dirtyFilters]
  );

  const updateFilter = useCallback(
    (
      filter: BrowseFilter,
      newColumn: HelppoColumn,
      newFilterType?: FilterType,
      newValue?: string
    ) => {
      setDirtyFilters(
        dirtyFilters.map((item) => {
          if (item === filter) {
            if (newColumn !== undefined) {
              const filterType = getFilterTypeByKey(filterTypes, item.type);
              const compatibleFilterType = filterType.columnNames.find(
                matchTableColumn(table.name, newColumn.name)
              )
                ? filterType
                : getFirstCompatibleFilterType(
                    table.name,
                    filterTypes,
                    newColumn
                  );
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
        })
      );
    },
    [table, dirtyFilters, filterTypes]
  );

  useEffect(() => {
    if (focusLastSelect && lastColumnSelectRef.current) {
      lastColumnSelectRef.current.focus();
      setFocusLastSelect(false);
    }
  }, [lastColumnSelectRef, focusLastSelect]);

  return h(
    "form",
    {
      className: "Filters",
      onSubmit: (event) => {
        event.preventDefault();
        triggerOnChange();
      },
    },
    h(
      "div",
      { className: "toolbar" },
      h(
        "button",
        {
          type: "button",
          className: "toolbar-button",
          onClick: addFilter,
        },
        "+ Add filter"
      ),
      dirtyFilters.length > 0 &&
        h(
          "button",
          {
            type: "button",
            className: "toolbar-button",
            onClick: clearAllFilters,
          },
          "Clear filters"
        ),
      h(
        "a",
        {
          className: "toolbar-button toolbar-button--right",
          title:
            "Link to this page, including currently active filters, presentation options such as collapsed columns, and current page number",
          href:
            typeof window !== "undefined"
              ? window.location.toString()
              : "[window.location.toString()]",
        },
        "Link to this page"
      )
    ),
    dirtyFilters.length > 0 &&
      h(
        "div",
        { className: "filter-boxes" },
        dirtyFilters.map((dirtyFilter, index) => {
          const { columnName, type, value } = dirtyFilter;
          const column = getColumnByName(table.columns, columnName);
          const isLast = index === dirtyFilters.length - 1;
          return h(
            "div",
            {
              key: index,
              className: "filter-box",
            },
            h(Select, {
              slim: true,
              placeholder: "Column",
              ref: isLast ? lastColumnSelectRef : null,
              options: table.columns
                .filter((column) => {
                  return (
                    getFirstCompatibleFilterType(
                      table.name,
                      filterTypes,
                      column
                    ) && !column.secret
                  );
                })
                .map((column) => {
                  return {
                    text: niceifyName(column.name),
                    value: column.name,
                  };
                }),
              value: columnName,
              onChange: (value: string) => {
                const newColumn = getColumnByName(table.columns, value);
                updateFilter(dirtyFilter, newColumn);
              },
            }),
            h(Select, {
              slim: true,
              options: filterTypes.map((filterType) => {
                return {
                  text: filterType.name,
                  value: filterType.key,
                  disabled: !filterType.columnNames.some(
                    matchTableColumn(table.name, column.name)
                  ),
                };
              }),
              value: type,
              onChange: (value: string) => {
                const newFilterType = getFilterTypeByKey(filterTypes, value);
                updateFilter(dirtyFilter, undefined, newFilterType);
              },
            }),
            !["null", "notNull"].includes(type) &&
              h(TextInput, {
                slim: true,
                value: value === null ? "" : value.toString(),
                onChange: (newValue) =>
                  updateFilter(dirtyFilter, undefined, undefined, newValue),
              }),
            h(
              "button",
              {
                type: "button",
                className: "toolbar-button",
                onClick: () =>
                  dirtyFilters.length === 1
                    ? clearAllFilters()
                    : removeFilter(dirtyFilter),
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
                JSON.stringify(dirtyFilters) === JSON.stringify(filters)
                  ? ButtonStyles.GHOST
                  : ButtonStyles.SUCCESS,
              slim: true,
            },
            "Apply"
          )
        )
      )
  );
};

export default Filters;
