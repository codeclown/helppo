// SIMPLE

export interface FilterType {
  key: string;
  name: string;
  columnTypes: string[];
}

// TODO this is poorly named
export type QueryParam = string | number | boolean | null;

export interface RowObject {
  [columnName: string]: QueryParam;
}

// BROWSEOPTIONS

export type BrowseFilterType =
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

export interface BrowseFilter {
  type: BrowseFilterType;
  columnName: string;
  value: QueryParam;
}

export interface BrowseOptions {
  perPage: number;
  currentPage: number;
  filters: BrowseFilter[];
  orderByColumn: string | null;
  orderByDirection: "asc" | "desc";
  wildcardSearch: string;
}

// SCHEMA

export type HelppoColumnType =
  | "integer"
  | "string"
  | "text"
  | "date"
  | "datetime"
  | "boolean";

interface BaseHelppoColumn {
  name: string;
  type: HelppoColumnType;
  nullable?: boolean;
  autoIncrements?: boolean;
  referencesTable?: string;
  referencesColumn?: string;
  secret?: boolean;
  comment?: string;
}

export interface HelppoIntegerColumn extends BaseHelppoColumn {
  type: "integer";
}

export interface HelppoStringColumn extends BaseHelppoColumn {
  type: "string";
  maxLength?: number;
}

export interface HelppoTextColumn extends BaseHelppoColumn {
  type: "text";
  maxLength?: number;
}

export interface HelppoDateColumn extends BaseHelppoColumn {
  type: "date";
}

export interface HelppoDatetimeColumn extends BaseHelppoColumn {
  type: "datetime";
}

export interface HelppoBooleanColumn extends BaseHelppoColumn {
  type: "boolean";
}

export type HelppoColumn =
  | HelppoIntegerColumn
  | HelppoStringColumn
  | HelppoTextColumn
  | HelppoDateColumn
  | HelppoDatetimeColumn
  | HelppoBooleanColumn;

export interface HelppoTable {
  name: string;
  primaryKey?: string;
  columns: HelppoColumn[];
}

export interface HelppoSchema {
  tables: HelppoTable[];
}

// API RESPONSES

export interface ApiResponseConfigNotice {
  suggestedFreshSchema: HelppoSchema | null;
}

export type ApiResponseSchema = HelppoSchema;

export type ApiResponseColumnTypes = {
  type: string;
  builtInReactComponentName: string;
}[];

export type ApiResponseFilterTypes = FilterType[];

export type ApiResponseLicenseNotice = string;

export interface ApiResponseGetRows {
  rows: RowObject[];
  totalPages: number;
  totalResults: number;
}

export type ApiResponseSaveRow = RowObject;

export type ApiResponseDeleteRow = null;

export type ApiResponseExecuteRawSql =
  | {
      affectedRowsAmount: number;
      returnedRowsAmount: number;
      columnNames: string[];
      rows: QueryParam[][];
    }
  | { errorMessage: string };
