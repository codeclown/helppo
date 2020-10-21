const builtInFilterTypes = [
  {
    key: "equals",
    name: "equals",
    columnTypes: ["integer", "string", "text", "date", "datetime"],
  },
  {
    key: "notEquals",
    name: "does not equal",
    columnTypes: ["integer", "string", "text", "date", "datetime"],
  },
  { key: "contains", name: "contains", columnTypes: ["string", "text"] },
  {
    key: "notContains",
    name: "does not contain",
    columnTypes: ["string", "text"],
  },
  {
    key: "null",
    name: "is null",
    columnTypes: ["integer", "string", "text", "date", "datetime"],
  },
  {
    key: "notNull",
    name: "is not null",
    columnTypes: ["integer", "string", "text", "date", "datetime"],
  },
  {
    key: "gt",
    name: "> greater than",
    columnTypes: ["integer", "date", "datetime"],
  },
  {
    key: "gte",
    name: "≥ greater than or equal",
    columnTypes: ["integer", "date", "datetime"],
  },
  {
    key: "lt",
    name: "< lesser than",
    columnTypes: ["integer", "date", "datetime"],
  },
  {
    key: "lte",
    name: "≤ lesser than or equal",
    columnTypes: ["integer", "date", "datetime"],
  },
];

export default builtInFilterTypes;
