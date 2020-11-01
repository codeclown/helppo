import BoringDatepicker from "boring-datepicker/src/react";
import { createElement as h } from "react";

const DatePicker = ({ value, onChange, images }) => {
  return h(
    BoringDatepicker,
    { value, onChange, className: "DatePicker" },
    h("img", { src: images.calendar })
  );
};

export default DatePicker;
