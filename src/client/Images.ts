export default class Images {
  introArrow: string;
  magnifierArrow: string;
  magnifierPlus: string;
  collapseLeft: string;
  collapseRight: string;
  primaryKey: string;
  sortAsc: string;
  sortDesc: string;
  columnInfo: string;
  calendar: string;
  navIconTable: string;
  navIconDots: string;

  constructor(mountpath: string) {
    this.introArrow = `${mountpath}/assets/static/introArrow.svg`;
    this.magnifierArrow = `${mountpath}/assets/static/magnifierArrow.svg`;
    this.magnifierPlus = `${mountpath}/assets/static/magnifierPlus.svg`;
    this.collapseLeft = `${mountpath}/assets/static/collapseLeft.svg`;
    this.collapseRight = `${mountpath}/assets/static/collapseRight.svg`;
    this.primaryKey = `${mountpath}/assets/static/primaryKey.svg`;
    this.sortAsc = `${mountpath}/assets/static/sortAsc.svg`;
    this.sortDesc = `${mountpath}/assets/static/sortDesc.svg`;
    this.columnInfo = `${mountpath}/assets/static/columnInfo.svg`;
    this.calendar = `${mountpath}/assets/static/calendar.svg`;
    this.navIconTable = `${mountpath}/assets/static/navIconTable.svg`;
    this.navIconDots = `${mountpath}/assets/static/navIconDots.svg`;
  }
}
