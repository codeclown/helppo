import { formatDate, formatTime } from "./dateFormatting";
import { ColumnType, HelppoColumnType, QueryParam } from "./types";

// The mapping of possible column types
// ---
// In the future this could be extended to support adding custom
// column types. Hence the property name `builtInReactComponentName`
// which implies that the React-component is built into helppo.

// databaseValueToJsonifiable:
// Turn value returned from database into a JSON-compatible format.
// Default behaviour is to return value as-is
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
const databaseValueToJsonifiable = (value: any): QueryParam => {
  if (Buffer.isBuffer(value)) {
    return value.toString("utf8");
  }
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return value;
};

// parsedJsonValueToDatabaseValue:
// Turn value sent from client into the value that will be passed
// on to the database driver for saving.
// Default behaviour is to return value as-is
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
const parsedJsonValueToDatabaseValue = (value: QueryParam): any => value;

// See also `builtInColumnTypeComponents` in App.js

export const integer: ColumnType = {
  builtInReactComponentName: "ColumnTypeInteger",
  databaseValueToJsonifiable,
  parsedJsonValueToDatabaseValue,
};

export const string: ColumnType = {
  builtInReactComponentName: "ColumnTypeString",
  databaseValueToJsonifiable,
  parsedJsonValueToDatabaseValue,
};

export const text: ColumnType = {
  builtInReactComponentName: "ColumnTypeText",
  databaseValueToJsonifiable,
  parsedJsonValueToDatabaseValue,
};

const dateUtils = (formatForDb: (date: Date) => string) => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  databaseValueToJsonifiable: (value: any): QueryParam => {
    if (value === null) {
      return null;
    }
    if (typeof value === "string") {
      return value;
    }
    if (value instanceof Date) {
      return formatForDb(value);
    }
    throw new Error(
      `value was expected to be null or a string or a Date, was: ${JSON.stringify(
        value
      )}`
    );
  },
  parsedJsonValueToDatabaseValue: (value: QueryParam): null | string => {
    if (value === null) {
      return null;
    }
    if (typeof value === "string") {
      return value;
    }
    throw new Error(
      `value was expected to be null or a string, was: ${JSON.stringify(value)}`
    );
  },
});

export const date: ColumnType = {
  builtInReactComponentName: "ColumnTypeDate",
  ...dateUtils((date: Date) => formatDate(date)),
};

export const datetime: ColumnType = {
  builtInReactComponentName: "ColumnTypeDateTime",
  ...dateUtils((date: Date) => `${formatDate(date)} ${formatTime(date)}`),
};

export const boolean: ColumnType = {
  builtInReactComponentName: "ColumnTypeBoolean",
  databaseValueToJsonifiable: (value) => {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
    return databaseValueToJsonifiable(value);
  },
  parsedJsonValueToDatabaseValue,
};

const columnTypes: Record<HelppoColumnType, ColumnType> = {
  integer,
  string,
  text,
  date,
  datetime,
  boolean,
};

export default columnTypes;
