import yea from "yea";

// TODO should not read window like this
const ajax = yea.baseUrl(
  typeof window === "undefined" ? "{window.mountpath}" : window.mountpath
);

export async function getConfigNotice() {
  const response = await ajax.get("/api/config-notice").prop("data");
  return response;
}

export async function getSchema() {
  const response = await ajax.get("/api/schema").prop("data");
  return response;
}

export async function getColumnTypes() {
  const response = await ajax.get("/api/column-types").prop("data");
  return response;
}

export async function getFilterTypes() {
  const response = await ajax.get("/api/filter-types").prop("data");
  return response;
}

export async function getTableRows(table, browseOptions) {
  const response = await ajax
    .get(`/api/table/${table.name}/rows`)
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
}

export async function saveRow(table, rowId, row) {
  const response = await ajax
    .post(`/api/table/${table.name}/rows`)
    .query({ rowId })
    .json(row)
    .prop("data");
  return response;
}

export async function deleteRow(table, rowId) {
  const response = await ajax
    .delete(`/api/table/${table.name}/rows`)
    .query({ rowId });
  return response;
}

export async function runSqlQuery(sql) {
  const response = await ajax.post("/api/sql").json({ sql }).prop("data");
  return response;
}

export async function getLicenseNotice() {
  const response = await ajax.get("/api/license-notice").prop("data");
  return response;
}
