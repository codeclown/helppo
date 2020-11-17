import { HelppoTable } from "../sharedTypes";

const toUrl = (
  pattern: string,
  config: {
    params?: { [key: string]: string };
    query?: { [key: string]: string };
  }
): string => {
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

export default class Urls {
  homePattern: string;
  tableIndexPattern: string;
  browseTablePattern: string;
  editRowPattern: string;
  recentlyDeletedPattern: string;
  queryPattern: string;
  licenseNoticePattern: string;
  schemaPattern: string;

  constructor(mountpath: string) {
    this.homePattern = `${mountpath}/`;
    this.tableIndexPattern = `${mountpath}/table/:tableName`;
    this.browseTablePattern = `${mountpath}/table/:tableName/browse`;
    this.editRowPattern = `${mountpath}/table/:tableName/edit`;
    this.recentlyDeletedPattern = `${mountpath}/recently-deleted`;
    this.queryPattern = `${mountpath}/query`;
    this.licenseNoticePattern = `${mountpath}/license-notice`;
    this.schemaPattern = `${mountpath}/schema`;
  }

  homeUrl(): string {
    return toUrl(this.homePattern, {});
  }

  tableIndexUrl(table: HelppoTable): string {
    return toUrl(this.tableIndexPattern, {
      params: {
        tableName: table.name,
      },
    });
  }

  browseTableUrl(
    tableName: string,
    browseOptions = undefined,
    presentationOptions = undefined
  ): string {
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
  }

  editRowUrl(table: HelppoTable, rowId = undefined): string {
    return toUrl(this.editRowPattern, {
      params: {
        tableName: typeof table === "string" ? table : table.name,
      },
      query: {
        rowId: rowId ? JSON.stringify(rowId) : undefined,
      },
    });
  }

  recentlyDeletedUrl(): string {
    return toUrl(this.recentlyDeletedPattern, {});
  }

  queryUrl(): string {
    return toUrl(this.queryPattern, {});
  }

  licenseNoticeUrl(): string {
    return toUrl(this.licenseNoticePattern, {});
  }

  schemaUrl(): string {
    return toUrl(this.schemaPattern, {});
  }
}
