import ColumnTypeDateTime from "./ColumnTypeDateTime";

export default class ColumnTypeDate extends ColumnTypeDateTime {
  includeTime() {
    return false;
  }
}
