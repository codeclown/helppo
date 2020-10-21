import { createElement as h } from "react";

const TotalResults = ({ children }) => {
  return h("span", { className: "TotalResults" }, children);
};

export default TotalResults;
