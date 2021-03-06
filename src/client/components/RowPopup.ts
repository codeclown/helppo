import { createElement as h, ReactElement, useState } from "react";
import { createPortal } from "react-dom";
import { RowObject } from "../../sharedTypes";
import limitText from "../utils/limitText";
import niceifyName from "../utils/niceifyName";
import Code from "./Code";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSpinner from "./LoadingSpinner";
import Table from "./Table";

enum STATUS {
  LOADING = "LOADING",
  ERRORED = "ERRORED",
  READY = "READY",
}

const RowPopupContent = ({ status, row }) => {
  return status === STATUS.LOADING
    ? h(
        "div",
        { className: "RowPopup__text" },
        h(LoadingSpinner, { height: 16 })
      )
    : status === STATUS.ERRORED
    ? h("div", { className: "RowPopup__text" }, "Something went wrong.")
    : h(Table, {
        marginTop: true,
        tiny: true,
        noBorder: true,
        leftColumnIsTh: true,
        rows: Object.keys(row).map((columnName) => {
          const value = row[columnName];
          return [
            niceifyName(columnName),
            value === null
              ? h(Code, null, "NULL")
              : limitText(value.toString(), 50),
          ];
        }),
      });
};

const RowPopup = ({
  popupContainer,
  getRow,
  children,
}: {
  popupContainer: Element;
  getRow: () => Promise<RowObject>;
  children?: ReactElement;
}): ReactElement => {
  const [status, setStatus] = useState<STATUS>(null);
  const [row, setRow] = useState<RowObject>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);

  return h(
    "span",
    {
      onMouseOver: async (event) => {
        setIsOpen(true);
        const { left, top, width } = event.target.getBoundingClientRect();
        setX(left + width + 10);
        setY(top);
        setStatus(STATUS.LOADING);

        try {
          const row = await getRow();
          setRow(row);
          setStatus(STATUS.READY);
        } catch (exception) {
          // eslint-disable-next-line no-console
          console.error(exception);
          setStatus(STATUS.ERRORED);
        }
      },
      onMouseOut: async () => {
        setIsOpen(false);
      },
    },
    children,
    isOpen &&
      createPortal(
        h(
          "span",
          {
            className: "RowPopup",
            style: {
              left: x,
              top: y,
            },
          },
          h(ErrorBoundary, null, h(RowPopupContent, { status, row }))
        ),
        popupContainer
      )
  );
};

export default RowPopup;
