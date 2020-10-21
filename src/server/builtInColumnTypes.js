import format from "date-fns/format";

// The mapping of possible column types
// ---
// In the future this could be extended to support adding custom
// column types. Hence the property name `builtInReactComponentName`
// which implies that the React-component is built into helppo.

// databaseValueToJsonifiable:
// Turn value returned from database into a JSON-compatible format.
// Default behaviour is to return value as-is
const databaseValueToJsonifiable = (value) => {
  if (Buffer.isBuffer(value)) {
    return value.toString("utf8");
  }
  return value;
};

// parsedJsonValueToDatabaseValue:
// Turn value sent from client into the value that will be passed
// on to the database driver for saving.
// Default behaviour is to return value as-is
const parsedJsonValueToDatabaseValue = (value) => value;

// See also `builtInColumnTypeComponents` in App.js

const integer = {
  builtInReactComponentName: "ColumnTypeInteger",
  databaseValueToJsonifiable,
  parsedJsonValueToDatabaseValue,
};

const string = {
  builtInReactComponentName: "ColumnTypeString",
  databaseValueToJsonifiable,
  parsedJsonValueToDatabaseValue,
};

const text = {
  builtInReactComponentName: "ColumnTypeText",
  databaseValueToJsonifiable,
  parsedJsonValueToDatabaseValue,
};

const dateUtils = (formatForDb) => ({
  databaseValueToJsonifiable: (value) => {
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
  parsedJsonValueToDatabaseValue: (value) => {
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

const date = {
  builtInReactComponentName: "ColumnTypeDate",
  ...dateUtils((date) => format(date, "yyyy-MM-dd")),
};

const datetime = {
  builtInReactComponentName: "ColumnTypeDateTime",
  ...dateUtils((date) => format(date, "yyyy-MM-dd HH:mm:ss")),
};

const boolean = {
  builtInReactComponentName: "ColumnTypeBoolean",
  databaseValueToJsonifiable,
  parsedJsonValueToDatabaseValue,
};

const builtInColumnTypes = {
  integer,
  string,
  text,
  date,
  datetime,
  boolean,
};

export default builtInColumnTypes;
