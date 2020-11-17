import NativeDatepicker from "native-datepicker/src/react";
import { createElement as h, ReactElement } from "react";
import Images from "../Images";

const Datepicker = ({
  value,
  onChange,
  images,
}: {
  value: string;
  onChange: (value: string) => void;
  images: Images;
}): ReactElement => {
  return h(
    NativeDatepicker,
    { value, onChange, className: "Datepicker" },
    h("img", { src: images.calendar })
  );
};

export default Datepicker;
