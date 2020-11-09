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

export default function urls(mountpath) {
  return {
    homePattern: `${mountpath}/`,
    homeUrl() {
      return toUrl(this.homePattern, {});
    },

    tableIndexPattern: `${mountpath}/table/:tableName`,
    tableIndexUrl(table) {
      return toUrl(this.tableIndexPattern, {
        params: {
          tableName: table.name,
        },
      });
    },

    browseTablePattern: `${mountpath}/table/:tableName/browse`,
    browseTableUrl(
      tableName,
      browseOptions = undefined,
      presentationOptions = undefined
    ) {
      return toUrl(this.browseTablePattern, {
        params: {
          tableName,
        },
        query: {
          browseOptions: browseOptions
            ? JSON.stringify(browseOptions)
            : undefined,
          presentationOptions: presentationOptions
            ? JSON.stringify(presentationOptions)
            : undefined,
        },
      });
    },

    editRowPattern: `${mountpath}/table/:tableName/edit`,
    editRowUrl(table, rowId = undefined) {
      return toUrl(this.editRowPattern, {
        params: {
          tableName: typeof table === "string" ? table : table.name,
        },
        query: {
          rowId: rowId ? JSON.stringify(rowId) : undefined,
        },
      });
    },

    recentlyDeletedPattern: `${mountpath}/recently-deleted`,
    recentlyDeletedUrl() {
      return toUrl(this.recentlyDeletedPattern, {});
    },

    queryPattern: `${mountpath}/query`,
    queryUrl() {
      return toUrl(this.queryPattern, {});
    },

    licenseNoticePattern: `${mountpath}/license-notice`,
    licenseNoticeUrl() {
      return toUrl(this.licenseNoticePattern, {});
    },

    schemaPattern: `${mountpath}/schema`,
    schemaUrl() {
      return toUrl(this.schemaPattern, {});
    },
  };
}
