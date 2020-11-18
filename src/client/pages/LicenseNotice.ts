import { createElement as h, ReactElement, useEffect, useState } from "react";
import Api from "../Api";
import { CatchApiError } from "../App";
import CodeBlock from "../components/CodeBlock";
import Container from "../components/Container";
import LoadingSpinner from "../components/LoadingSpinner";

interface LicenseNoticeProps {
  api: Pick<Api, "getLicenseNotice">;
  catchApiError: CatchApiError;
}

const LicenseNotice = ({
  api,
  catchApiError,
}: LicenseNoticeProps): ReactElement => {
  const [licenseNotice, setLicenseNotice] = useState(null);

  useEffect(() => {
    catchApiError(api.getLicenseNotice()).then((notice) => {
      setLicenseNotice(notice);
    });
  }, [api, catchApiError]);

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
