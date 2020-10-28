import { createElement as h, Fragment } from "react";

const PageTitle = ({ children }) => {
  if (typeof document === "undefined") {
    // eslint-disable-next-line no-console
    console.log("Warning: Rendering PageTitle without access to DOM");
    return h(Fragment);
  }

  if (typeof children !== "string") {
    throw new Error("PageTitle expects a single string child");
  }

  const title = children;
  document.title = title && title.length > 0 ? `${title} | Helppo` : "Helppo";
  return h(Fragment);
};

export default PageTitle;
