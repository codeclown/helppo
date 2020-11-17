import { BrowseOptions } from "../sharedTypes";

const validateBrowseOptions = (
  columnNames: string[],
  filterTypes: string[],
  browseOptions: BrowseOptions
): void => {
  const {
    perPage,
    currentPage,
    filters,
    orderByColumn,
    orderByDirection,
    wildcardSearch,
  } = browseOptions;
  if (!Number.isInteger(perPage)) {
    throw new Error("Expected browseOptions.perPage to be an integer");
  }
  if (!Number.isInteger(currentPage)) {
    throw new Error("Expected browseOptions.currentPage to be an integer");
  }
  if (
    !Array.isArray(filters) ||
    filters.some((item) => typeof item !== "object")
  ) {
    throw new Error("Expected browseOptions.filters to be an array of objects");
  }
  if (
    filterTypes.length &&
    filters.some((item) => !filterTypes.includes(item.type))
  ) {
    throw new Error(
      `Expected browseOptions.filters[].type to be one of ${filterTypes.join(
        ", "
      )}`
    );
  }
  if (filters.some((item) => !columnNames.includes(item.columnName))) {
    throw new Error(
      "Expected browseOptions.filters[].columnName to be included in columnNames"
    );
  }
  if (orderByColumn !== null && !columnNames.includes(orderByColumn)) {
    throw new Error(
      "Expected browseOptions.orderByColumn to be null or included in columnNames"
    );
  }
  if (!["asc", "desc"].includes(orderByDirection)) {
    throw new Error(
      "Expected browseOptions.orderByDirection to be 'asc' or 'desc'"
    );
  }
  if (typeof wildcardSearch !== "string") {
    throw new Error("Expected browseOptions.wildcardSearch to be a string");
  }
};

export default validateBrowseOptions;
