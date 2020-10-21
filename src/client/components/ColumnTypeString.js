import { createElement as h, Fragment } from "react";
import BaseColumnType from "./BaseColumnType";
import TextInput from "./TextInput";
import FormHelpMessage from "./FormHelpMessage";

export default class ColumnTypeString extends BaseColumnType {
  isMultiLine() {
    return false;
  }

  renderEditable({ value, onChange, inputProps, column }) {
    const showMaxLengthWarning =
      column.maxLength !== undefined &&
      typeof value === "string" &&
      value.length > column.maxLength;

    return h(
      Fragment,
      null,
      h(TextInput, {
        ...inputProps,
        multiLine: this.isMultiLine(),
        value: value === null ? "" : value,
        onChange,
        danger: showMaxLengthWarning,
      }),
      showMaxLengthWarning &&
        h(
          FormHelpMessage,
          { danger: true },
          `Warning: value is ${value.length} characters long (column maximum is ${column.maxLength})`
        )
    );
  }
}
