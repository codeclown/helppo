import { HelppoSchema } from "./types";

const parseIdReference = (columnName: string): string => {
  const match = columnName.match(/^(.+)(id)$/i);
  if (!match) {
    return;
  }
  return match[1].endsWith("_") ? match[1].slice(0, -1) : match[1];
};

const singularize = (string: string): string => {
  return string.endsWith("s") ? string.slice(0, -1) : string;
};

const pluralize = (string: string): string => {
  return string.endsWith("s") ? string : `${string}s`;
};

// Find table relations based on column names, even if foreign keys aren't in use
export default function findColumnRelations(
  schema: HelppoSchema
): HelppoSchema {
  return {
    tables: schema.tables.map((table) => {
      return {
        ...table,
        columns: table.columns.map((column) => {
          if (column.referencesTable) {
            return column;
          }

          const idReference = parseIdReference(column.name);
          if (!idReference) {
            return column;
          }

          const matchingTable = schema.tables.find((table) => {
            return (
              table.name === singularize(idReference) ||
              table.name === pluralize(idReference)
            );
          });

          if (!matchingTable) {
            return column;
          }

          return {
            ...column,
            referencesTable: matchingTable.name,
            referencesColumn: matchingTable.primaryKey,
          };
        }),
      };
    }),
  };
}
