interface HelppoSchema {
  tables: {
    name: string;
    primaryKey?: string;
    columns: ({
      name: string;
      nullable?: boolean;
      autoIncrements?: boolean;
      referencesTable?: string;
      referencesColumn?: string;
      secret?: boolean;
      comment?: string;
    } & (
      | {
          type: "integer";
        }
      | {
          type: "string";
          maxLength?: number;
        }
      | {
          type: "text";
          maxLength?: number;
        }
      | {
          type: "date";
        }
      | {
          type: "datetime";
        }
      | {
          type: "boolean";
        }
    ))[];
  }[];
}

type BrowseFilterType =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "null"
  | "notNull"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

type QueryParam = string | number | null;

interface BrowseFilter {
  type: BrowseFilterType;
  columnName: string;
  value: QueryParam;
}

interface BrowseOptions {
  perPage: number;
  currentPage: number;
  filters: BrowseFilter[];
  orderByColumn: string | null;
  orderByDirection: "asc" | "desc";
  wildcardSearch: string;
}

interface QueryObject {
  sql: string;
  params: (QueryParam | QueryParam[])[];
}

type ParamFormatter = (
  query: QueryObject,
  segments: (
    | string
    | { param?: QueryParam | QueryParam[]; identifier?: string }
  )[]
) => QueryObject;

interface GetRowsResult {
  rows: any[];
  totalPages: number;
  totalResults: number;
}

abstract class HelppoDriver {
  abstract getRows(
    tableName: string,
    browseOptions: BrowseOptions
  ): Promise<GetRowsResult>;
}

interface FilterType {
  key: string;
  name: string;
  columnTypes: string[];
}
