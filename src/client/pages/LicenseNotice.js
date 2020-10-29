import { createElement as h, useEffect, useState } from "react";
import CodeBlock from "../components/CodeBlock";
import Container from "../components/Container";
import LoadingSpinner from "../components/LoadingSpinner";

const LicenseNotice = ({ api, catchApiError }) => {
  const [licenseNotice, setLicenseNotice] = useState(null);

  useEffect(() => {
    catchApiError(api.getLicenseNotice()).then((notice) => {
      setLicenseNotice(notice);
    });
  }, []);

  return h(
    Container,
    null,
    licenseNotice
      ? h(
          CodeBlock,
          {
            maxHeight: 500,
          },
          licenseNotice
        )
      : h(LoadingSpinner, { height: 16 })
  );
};

export default LicenseNotice;
