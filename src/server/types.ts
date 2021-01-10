import {
  BrowseOptions,
  FilterType,
  HelppoSchema,
  HelppoTable,
  QueryParam,
  RowObject,
} from "../sharedTypes";

export interface HelppoConfig {
  driver: HelppoDriver;
  schema?: "auto" | HelppoSchema;
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

export abstract class HelppoDriver {
  abstract __internalOnClose(callback: (err: Error) => void): void;

  abstract getSchema(): Promise<HelppoSchema>;

  abstract getFilterTypes(): Promise<FilterType[]>;

  abstract getRows(
    table: HelppoTable,
    browseOptions: BrowseOptions,
    options: {
      filterTypes: FilterType[];
    }
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

export interface SqlTable {
  name: string;
}

export interface ColumnType {
  builtInReactComponentName: string;
  databaseValueToJsonifiable: (value: unknown) => QueryParam;
  parsedJsonValueToDatabaseValue: (value: QueryParam) => unknown;
}
