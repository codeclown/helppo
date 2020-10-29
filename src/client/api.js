import yea from "yea";

export default function api(mountpath) {
  const ajax = yea.baseUrl(mountpath);

  return {
    async getConfigNotice() {
      const response = await ajax.get("/api/config-notice").prop("data");
      return response;
    },

    async getSchema() {
      const response = await ajax.get("/api/schema").prop("data");
      return response;
    },

    async getColumnTypes() {
      const response = await ajax.get("/api/column-types").prop("data");
      return response;
    },

    async getFilterTypes() {
      const response = await ajax.get("/api/filter-types").prop("data");
      return response;
    },

    async getTableRows(tableName, browseOptions) {
      const response = await ajax
        .get(`/api/table/${tableName}/rows`)
        .query({
          browseOptions: JSON.stringify(browseOptions),
        })
        .prop("data");
      return {
        rows: response.rows,
        totalPages: response.totalPages,
        totalResults: response.totalResults,
        relatedCounts: response.relatedCounts,
        browseOptions,
      };
    },

    async saveRow(table, rowId, row) {
      const response = await ajax
        .post(`/api/table/${table.name}/rows`)
        .query({ rowId })
        .json(row)
        .prop("data");
      return response;
    },

    async deleteRow(table, rowId) {
      const response = await ajax
        .delete(`/api/table/${table.name}/rows`)
        .query({ rowId });
      return response;
    },

    async runSqlQuery(sql) {
      const response = await ajax.post("/api/sql").json({ sql }).prop("data");
      return response;
    },

    async getLicenseNotice() {
      const response = await ajax.get("/api/license-notice").prop("data");
      return response;
    },
  };
}
