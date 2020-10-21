import { createElement as h, useEffect, useState } from "react";
import CodeBlock from "../components/CodeBlock";
import Container from "../components/Container";
import { getLicenseNotice } from "../api";

const LicenseNotice = ({ catchApiError }) => {
  const [licenseNotice, setLicenseNotice] = useState(null);

  useEffect(() => {
    catchApiError(getLicenseNotice()).then((notice) => {
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
