import { createElement as h, Fragment } from "react";
import BaseColumnType from "./BaseColumnType";
import DatePicker from "./DatePicker";
import TextInput from "./TextInput";

export default class ColumnTypeDateTime extends BaseColumnType {
  includeTime() {
    return true;
  }

  renderEditable({ value, onChange, inputProps, images }) {
    const includeTime = this.includeTime();
    value = value === null ? "" : value;
    return h(
      Fragment,
      null,
      h(TextInput, {
        ...inputProps,
        ref: this.inputRef,
        size: includeTime ? 18 : 12,
        value,
        onChange,
      }),
      " ",
      h(DatePicker, { value, onChange, images })
    );
  }
}
