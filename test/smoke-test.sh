#!/bin/bash

# This script goes through a process of:
#   1. Packaging Helppo like it would be packaged to npm
#   2. Installing the packaged Helppo, and Puppeteer,
#      in a sub-directory. We don't want to include
#      Puppeteer in the main project package.json for
#      this one purpose only.
#   3. Running a simple script which starts Helppo and
#      opens it in Puppeteer to check that the front-end
#      is working as expected.

set -e

if ! [ -f package.json ]; then
  echo "This script is meant to be ran in the project root"
  exit 1
fi

rm -rf ./smoke-test
mkdir -p ./smoke-test


#
# Pack Helppo into an npm package and run the CLI from it
#

yarn pack --filename ./smoke-test/smoke-test-package.tgz

echo {} > ./smoke-test/package.json

yarn --cwd ./smoke-test add file:./smoke-test-package.tgz

# Start a Helppo server
yarn --cwd ./smoke-test helppo-cli-local mysql://root:secret@127.0.0.1:7812/dev_db &
helppo_pid=$!


#
# Install puppeteer and run smoke test
#

yarn --cwd ./smoke-test add puppeteer

echo '
const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3000");
  await page.waitForSelector(".BlockLinkList", {
    timeout: 10000
  });
  console.log("");
  console.log("Found .BlockLinkList");
  console.log("");
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
' > ./smoke-test/run.js

node ./smoke-test/run.js


#
# Stop processes and clean up
#

echo "Passed! Cleaning up..."
kill $helppo_pid
rm -rf ./smoke-test
echo "Done"
