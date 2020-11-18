import {
  createElement as h,
  useState,
  useRef,
  useCallback,
  ReactElement,
  useEffect,
} from "react";
import { BrowseFilter, FilterType, HelppoColumn } from "../../sharedTypes";
import niceifyName from "../utils/niceifyName";
import Button, { ButtonStyles } from "./Button";
import Select from "./Select";
import TextInput from "./TextInput";

function getFirstCompatibleFilterType(
  filterTypes: FilterType[],
  column: HelppoColumn
): FilterType {
  return filterTypes.find((filterType) => {
    return filterType.columnTypes.includes(column.type);
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
  columns,
  onChange,
}: {
  filters: BrowseFilter[];
  filterTypes: FilterType[];
  columns: HelppoColumn[];
  onChange: (filters: BrowseFilter[]) => void;
}): ReactElement => {
  const [dirtyFilters, setDirtyFilters] = useState<BrowseFilter[]>(() =>
    filters.map((filter) => ({ ...filter }))
  );
  const [focusLastSelect, setFocusLastSelect] = useState<boolean>(false);
  const lastColumnSelectRef = useRef<HTMLSelectElement>();

  const triggerOnChange = useCallback(() => {
    onChange(dirtyFilters);
  }, [onChange, dirtyFilters]);

  const addFilter = useCallback(() => {
    const firstColumn = columns[0];
    const firstCompatibleFilterType = getFirstCompatibleFilterType(
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
  }, [columns, dirtyFilters, filterTypes]);

  const clearAllFilters = useCallback(() => {
    setDirtyFilters([]);
    setTimeout(triggerOnChange);
  }, [triggerOnChange]);

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
              const compatibleFilterType = filterType.columnTypes.includes(
                newColumn.type
              )
                ? filterType
                : getFirstCompatibleFilterType(filterTypes, newColumn);
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
    [dirtyFilters, filterTypes]
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
          const column = getColumnByName(columns, columnName);
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
              ref: isLast && lastColumnSelectRef,
              options: columns
                .filter((column) => {
                  return (
                    getFirstCompatibleFilterType(filterTypes, column) &&
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
              onChange: (value: string) => {
                const newColumn = getColumnByName(columns, value);
                updateFilter(dirtyFilter, newColumn);
              },
            }),
            h(Select, {
              slim: true,
              options: filterTypes.map((filterType) => {
                return {
                  text: filterType.name,
                  value: filterType.key,
                  disabled: !filterType.columnTypes.includes(column.type),
                };
              }),
              value: type,
              onChange: (value: string) => {
                const newFilterType = getFilterTypeByKey(filterTypes, value);
                updateFilter(dirtyFilter, undefined, newFilterType);
              },
            }),
            h(TextInput, {
              slim: true,
              value: value.toString(),
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
