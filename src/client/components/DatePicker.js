import { createElement as h } from "react";
import BoringDatepicker from "./BoringDatepicker";

const DatePicker = ({ value, onChange, images }) => {
  return h(
    BoringDatepicker,
    { value, onChange, className: "DatePicker" },
    h("img", { src: images.calendar })
  );
};

export default DatePicker;
