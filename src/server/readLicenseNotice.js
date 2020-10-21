import fs from "fs";
import path from "path";

// Find folder containing package.json
function findProjectRoot() {
  let dir = __dirname;
  // Two options what __dirname is expected to be:
  //   - <root>/dist/server/  <- when running yarn dev
  //   - <root>/              <- when running helppo-cli
  let depth = 3;
  while (depth--) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error("Was not able to find package.json");
}

export default function readLicenseNotice() {
  const rootDir = findProjectRoot();
  const noticeFile = path.join(rootDir, "LICENSE-3RD-PARTIES");
  if (!fs.existsSync(noticeFile)) {
    throw new Error("Was not able to find LICENSE-3RD-PARTIES");
  }
  const licenseNotice = fs.readFileSync(noticeFile, "utf8");
  return licenseNotice;
}
