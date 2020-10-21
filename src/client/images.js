// TODO should not read window like this
const baseUrl =
  typeof window === "undefined" ? "{window.mountpath}" : window.mountpath;

export const introArrow = `${baseUrl}/assets/static/introArrow.svg`;

export const magnifier = `${baseUrl}/assets/static/magnifier.svg`;

export const collapseLeft = `${baseUrl}/assets/static/collapseLeft.svg`;

export const collapseRight = `${baseUrl}/assets/static/collapseRight.svg`;

export const primaryKey = `${baseUrl}/assets/static/primaryKey.svg`;

export const sortAsc = `${baseUrl}/assets/static/sortAsc.svg`;

export const sortDesc = `${baseUrl}/assets/static/sortDesc.svg`;

export const columnInfo = `${baseUrl}/assets/static/columnInfo.svg`;

export const calendar = `${baseUrl}/assets/static/calendar.svg`;

export const navIconTable = `${baseUrl}/assets/static/navIconTable.svg`;

export const navIconDots = `${baseUrl}/assets/static/navIconDots.svg`;
