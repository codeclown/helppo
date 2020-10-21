import { createElement as h, Fragment } from "react";
import BaseColumnType from "./BaseColumnType";
import TextInput from "./TextInput";
import DatePicker from "./DatePicker";

export default class ColumnTypeDateTime extends BaseColumnType {
  includeTime() {
    return true;
  }

  renderEditable({ value, onChange, inputProps }) {
    const includeTime = this.includeTime();
    return h(
      Fragment,
      null,
      h(TextInput, {
        ...inputProps,
        size: includeTime ? 18 : 12,
        value: value === null ? "" : value,
        onChange,
      }),
      " ",
      h(DatePicker, {
        value,
        onChange,
      })
    );
  }
}
