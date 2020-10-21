import ColumnTypeString from "./ColumnTypeString";

export default class ColumnTypeText extends ColumnTypeString {
  isMultiLine() {
    return true;
  }
}
