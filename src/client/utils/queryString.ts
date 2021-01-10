import {
  BrowseOptions,
  FilterType,
  OrderByDirection,
  orderByDirections,
  PresentationOptions,
} from "../../sharedTypes";

const defaultBrowseOptions: BrowseOptions = {
  perPage: 20,
  currentPage: 1,
  filters: [],
  orderByColumn: null,
  orderByDirection: "asc",
  wildcardSearch: "",
};

const defaultPresentationOptions: PresentationOptions = {
  collapsedColumns: [],
};

export function parseBrowseOptions(
  searchParams: URLSearchParams,
  filterTypes: FilterType[]
): BrowseOptions {
  const browseOptions: BrowseOptions = {
    ...defaultBrowseOptions,
  };
  try {
    const obj = JSON.parse(searchParams.get("browseOptions"));
    if (typeof obj.perPage === "number") {
      browseOptions.perPage = obj.perPage;
    }
    if (typeof obj.currentPage === "number") {
      browseOptions.currentPage = obj.currentPage;
    }
    if (Array.isArray(obj.filters)) {
      browseOptions.filters = obj.filters
        .filter((item) =>
          filterTypes.some((filterType) => filterType.key === item.type)
        )
        .map((item) => {
          return {
            type: item.type,
            columnName: item.columnName,
            value: item.value,
          };
        });
    }
    if (typeof obj.orderByColumn === "string") {
      browseOptions.orderByColumn = obj.orderByColumn;
    }
    if (
      typeof obj.orderByDirection === "string" &&
      orderByDirections.find((item) => item === obj.orderByDirection)
    ) {
      browseOptions.orderByDirection = obj.orderByDirection as OrderByDirection;
    }
    if (typeof obj.wildcardSearch === "string") {
      browseOptions.wildcardSearch = obj.wildcardSearch;
    }
  } catch (error) {
    // do nothing
  }
  return browseOptions;
}

export function parsePresentationOptions(
  searchParams: URLSearchParams
): PresentationOptions {
  const presentationOptions: PresentationOptions = {
    ...defaultPresentationOptions,
  };
  try {
    const obj = JSON.parse(searchParams.get("presentationOptions"));
    if (Array.isArray(obj.collapsedColumns)) {
      presentationOptions.collapsedColumns = obj.collapsedColumns.map((item) =>
        item.toString()
      );
    }
  } catch (error) {
    // do nothing
  }
  return presentationOptions;
}
