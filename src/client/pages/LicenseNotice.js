import { createElement as h, useEffect, useState } from "react";
import CodeBlock from "../components/CodeBlock";
import Container from "../components/Container";

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
      : "Loading license notice…"
  );
};

export default LicenseNotice;
