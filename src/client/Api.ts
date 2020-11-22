import yea from "yea";
import {
  ApiResponseColumnTypes,
  ApiResponseConfigNotice,
  ApiResponseDeleteRow,
  ApiResponseExecuteRawSql,
  ApiResponseFilterTypes,
  ApiResponseGetRows,
  ApiResponseSaveRow,
  ApiResponseSchema,
  BrowseOptions,
  HelppoTable,
  QueryParam,
  RowObject,
} from "../sharedTypes";

export type ApiResponseGetRowsWithBrowseOptions = ApiResponseGetRows & {
  browseOptions: BrowseOptions;
};

export default class Api {
  ajax: typeof yea;

  constructor(mountpath: string) {
    this.ajax = yea.baseUrl(mountpath);
  }

  async getConfigNotice(): Promise<ApiResponseConfigNotice> {
    const response = (await this.ajax
      .get("/api/config-notice")
      .prop("data")) as unknown;
    return response as ApiResponseConfigNotice;
  }

  async getSchema(): Promise<ApiResponseSchema> {
    const response = (await this.ajax
      .get("/api/schema")
      .prop("data")) as unknown;
    return response as ApiResponseSchema;
  }

  async getColumnTypes(): Promise<ApiResponseColumnTypes> {
    const response = (await this.ajax
      .get("/api/column-types")
      .prop("data")) as unknown;
    return response as ApiResponseColumnTypes;
  }

  async getFilterTypes(): Promise<ApiResponseFilterTypes> {
    const response = (await this.ajax
      .get("/api/filter-types")
      .prop("data")) as unknown;
    return response as ApiResponseFilterTypes;
  }

  async getTableRows(
    tableName: string,
    browseOptions: BrowseOptions
  ): Promise<ApiResponseGetRowsWithBrowseOptions> {
    const response = ((await this.ajax
      .get(`/api/table/${tableName}/rows`)
      .query({
        browseOptions: JSON.stringify(browseOptions),
      })
      .prop("data")) as unknown) as ApiResponseGetRows;
    return {
      rows: response.rows,
      totalPages: response.totalPages,
      totalResults: response.totalResults,
      browseOptions,
    };
  }

  async saveRow(
    table: HelppoTable,
    rowId: QueryParam,
    row: RowObject
  ): Promise<ApiResponseSaveRow> {
    const response = (await this.ajax
      .post(`/api/table/${table.name}/rows`)
      .query({ rowId })
      .json(row)
      .prop("data")) as unknown;
    return response as ApiResponseSaveRow;
  }

  async deleteRow(
    table: HelppoTable,
    rowId: QueryParam
  ): Promise<ApiResponseDeleteRow> {
    const response = (await this.ajax
      .delete(`/api/table/${table.name}/rows`)
      .query({ rowId })) as unknown;
    return response as ApiResponseDeleteRow;
  }

  async runSqlQuery(sql: string): Promise<ApiResponseExecuteRawSql> {
    const response = (await this.ajax
      .post("/api/sql")
      .json({ sql })
      .prop("data")) as unknown;
    return response as ApiResponseExecuteRawSql;
  }

  async getLicenseNotice(): Promise<ApiResponseColumnTypes> {
    const response = (await this.ajax
      .get("/api/license-notice")
      .prop("data")) as unknown;
    return response as ApiResponseColumnTypes;
  }
}

export class MockApi extends Api {
  async getConfigNotice(): Promise<ApiResponseConfigNotice> {
    return new Promise(() => {
      // never resolve
    });
  }

  async getSchema(): Promise<ApiResponseSchema> {
    return new Promise(() => {
      // never resolve
    });
  }

  async getColumnTypes(): Promise<ApiResponseColumnTypes> {
    return new Promise(() => {
      // never resolve
    });
  }

  async getFilterTypes(): Promise<ApiResponseFilterTypes> {
    return new Promise(() => {
      // never resolve
    });
  }

  async getTableRows(): Promise<ApiResponseGetRowsWithBrowseOptions> {
    return new Promise(() => {
      // never resolve
    });
  }

  async saveRow(): Promise<ApiResponseSaveRow> {
    return new Promise(() => {
      // never resolve
    });
  }

  async deleteRow(): Promise<ApiResponseDeleteRow> {
    return new Promise(() => {
      // never resolve
    });
  }

  async runSqlQuery(): Promise<ApiResponseExecuteRawSql> {
    return new Promise(() => {
      // never resolve
    });
  }

  async getLicenseNotice(): Promise<ApiResponseColumnTypes> {
    return new Promise(() => {
      // never resolve
    });
  }
}
