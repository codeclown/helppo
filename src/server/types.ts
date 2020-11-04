
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

interface HelppoIntegerColumn extends BaseHelppoColumn {
  type: "integer";
}

interface HelppoStringColumn extends BaseHelppoColumn {
  type: "string";
  maxLength?: number;
}

interface HelppoTextColumn extends BaseHelppoColumn {
  type: "text";
  maxLength?: number;
}

interface HelppoDateColumn extends BaseHelppoColumn {
  type: "date";
}

interface HelppoDatetimeColumn extends BaseHelppoColumn {
  type: "datetime";
}

interface HelppoBooleanColumn extends BaseHelppoColumn {
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

export interface HelppoConfig {
  driver: HelppoDriver;
  schema?: "auto" | HelppoSchema;
}

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

// TODO this is poorly named
export type QueryParam = string | number | boolean | null;

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

export interface QueryObject {
  sql: string;
  params: (QueryParam | QueryParam[])[];
}

export type QueryFormatter = (
  query: QueryObject,
  segments: (
    | string
    | { param: QueryParam | QueryParam[] }
    | { identifier: string | string[] }
  )[],
  options?: {
    isReturningClause?: boolean;
  }
) => QueryObject;

export interface RowObject {
  [columnName: string]: QueryParam;
}

export abstract class HelppoDriver {
  abstract __internalOnClose(callback: (err: Error) => void): void;

  abstract getSchema(): Promise<HelppoSchema>;

  abstract getRows(
    table: HelppoTable,
    browseOptions: BrowseOptions
  ): Promise<{
    rows: RowObject[];
    totalPages: number;
    totalResults: number;
  }>;

  abstract saveRow(
    table: HelppoTable,
    rowId: string | number,
    row: RowObject
  ): Promise<RowObject>;

  abstract deleteRow(table: HelppoTable, rowId: string): Promise<void>;

  abstract executeRawSqlQuery(
    sql: string
  ): Promise<{
    affectedRowsAmount: number;
    returnedRowsAmount: number;
    columnNames: string[];
    rows: QueryParam[][];
  }>;
}

export interface FilterType {
  key: string;
  name: string;
  columnTypes: string[];
}

export interface SqlTable {
  name: string;
}

export interface ColumnType {
  builtInReactComponentName: string;
  databaseValueToJsonifiable: (value: unknown) => QueryParam;
  parsedJsonValueToDatabaseValue: (value: QueryParam) => unknown;
}
