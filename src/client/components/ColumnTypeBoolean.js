import { createElement as h } from "react";
import BaseColumnType from "./BaseColumnType";
import CheckboxInput from "../components/CheckboxInput";
import Code from "../components/Code";

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
