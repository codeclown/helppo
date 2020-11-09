import NativeDatepicker from "native-datepicker/src/react";
import { createElement as h } from "react";

const DatePicker = ({ value, onChange, images }) => {
  return h(
    NativeDatepicker,
    { value, onChange, className: "DatePicker" },
    h("img", { src: images.calendar })
  );
};

export default DatePicker;
