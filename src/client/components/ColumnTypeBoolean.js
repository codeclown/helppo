import { createElement as h } from "react";
import CheckboxInput from "../components/CheckboxInput";
import Code from "../components/Code";
import BaseColumnType from "./BaseColumnType";

export default class ColumnTypeBoolean extends BaseColumnType {
  renderEditable({ value, onChange }) {
    return h(
      CheckboxInput,
      {
        checked: value,
        onChange,
      },
      h(Code, null, value ? "True" : "False")
    );
  }
}
