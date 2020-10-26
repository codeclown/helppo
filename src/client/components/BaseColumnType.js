import { Component, createElement as h } from "react";
import limitText from "../utils/limitText";

export default class BaseColumnType extends Component {
  static valueAsText(value) {
    if (value === null || value === undefined) {
      return "";
    }
    if (typeof value === "string") {
      return value;
    }
    return value.toString();
  }

  renderEditable() {
    return h("span", { title: "ColumnType implementation missing" });
  }

  renderReadOnly() {
    const string = this.constructor.valueAsText(this.props.value);
    return h(
      "span",
      { title: string.length > 60 ? limitText(string, 300) : "" },
      limitText(string, 60)
    );
  }

  render() {
    if (this.props.editable) {
      return this.renderEditable(this.props);
    }
    return this.renderReadOnly(this.props);
  }
}
