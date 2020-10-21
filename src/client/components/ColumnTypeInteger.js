import { createElement as h } from "react";
import BaseColumnType from "./BaseColumnType";
import TextInput from "./TextInput";

export default class ColumnTypeInteger extends BaseColumnType {
  renderEditable({ value, onChange, inputProps }) {
    return h(TextInput, {
      ...inputProps,
      size: 10,
      value: value === null ? "" : value,
      onChange: (value) => {
        onChange(value);
      },
      onBlur: (value) => {
        const integer = parseInt(value);
        onChange(isNaN(integer) ? null : integer);
      },
    });
  }
}
