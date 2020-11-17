import { createElement as h, ReactElement } from "react";

const TotalResults = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  return h("span", { className: "TotalResults" }, children);
};

export default TotalResults;
