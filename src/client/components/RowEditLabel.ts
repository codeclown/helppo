import { createElement as h, Fragment, ReactElement } from "react";
import Code from "./Code";

const RowEditLabel = ({
  columnName,
  columnType,
  hasUnsavedChanges,
  undoChanges,
}: {
  columnName: string;
  columnType: string;
  hasUnsavedChanges: boolean;
  undoChanges: () => void;
}): ReactElement => {
  return h(
    Fragment,
    null,
    h(
      "div",
      null,
      columnName,
      " ",
      hasUnsavedChanges &&
        h(
          "button",
          {
            type: "button",
            className: "RowEditLabel__unsavedAsterisk",
            title: "This value has not been saved – Click to undo changes",
            onClick: (event) => {
              event.preventDefault();
              undoChanges();
            },
          },
          "*"
        )
    ),
    h(Code, null, columnType)
  );
};

export default RowEditLabel;
