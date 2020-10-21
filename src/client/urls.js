// TODO should not read window like this
const mountpath = typeof window !== "undefined" ? window.mountpath : "";

const toUrl = (pattern, config) => {
  let url = pattern;
  if (config.params) {
    Object.keys(config.params).forEach((key) => {
      url = url.replace(`:${key}`, config.params[key]);
    });
  }
  if (config.query) {
    const params = new URLSearchParams();
    Object.keys(config.query).forEach((key) => {
      if (config.query[key] !== undefined) {
        params.append(key, config.query[key]);
      }
    });
    url += `?${params.toString()}`;
  }
  return url;
};

export const tableIndexPattern = `${mountpath}/table/:tableName`;
export const tableIndexUrl = (table) =>
  toUrl(tableIndexPattern, {
    params: {
      tableName: table.name,
    },
  });

export const browseTablePattern = `${mountpath}/table/:tableName/browse`;
export const browseTableUrl = (
  tableName,
  browseOptions = undefined,
  presentationOptions = undefined
) =>
  toUrl(browseTablePattern, {
    params: {
      tableName,
    },
    query: {
      browseOptions: browseOptions ? JSON.stringify(browseOptions) : undefined,
      presentationOptions: presentationOptions
        ? JSON.stringify(presentationOptions)
        : undefined,
    },
  });

export const editRowPattern = `${mountpath}/table/:tableName/edit`;
export const editRowUrl = (table, rowId = undefined) =>
  toUrl(editRowPattern, {
    params: {
      tableName: typeof table === "string" ? table : table.name,
    },
    query: {
      rowId: rowId ? JSON.stringify(rowId) : undefined,
    },
  });

export const recentlyDeletedPattern = `${mountpath}/recently-deleted`;
export const recentlyDeletedUrl = () => toUrl(recentlyDeletedPattern, {});

export const queryPattern = `${mountpath}/query`;
export const queryUrl = () => toUrl(queryPattern, {});

export const licenseNoticePattern = `${mountpath}/license-notice`;
export const licenseNoticeUrl = () => toUrl(licenseNoticePattern, {});
