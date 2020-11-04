import { HelppoSchema } from "./types";

const secrecyRegex = /(password|token|pass$)/i;

export default function findSecretColumns(schema: HelppoSchema): HelppoSchema {
  return {
    tables: schema.tables.map((table) => {
      return Object.assign({}, table, {
        columns: table.columns.map((column) => {
          if (column.secret !== undefined) {
            return column;
          }

          if (!column.name.match(secrecyRegex)) {
            return column;
          }

          return Object.assign({}, column, {
            secret: true,
          });
        }),
      });
    }),
  };
}
