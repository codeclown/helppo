#!/bin/bash

set -e

if [[ ! -d node_modules ]]; then
  echo "This script is meant to be ran in the project root!"
  exit 1
fi

out_dir="src/server/cli/dist"
entry_file="dist/server/cli/cli.js"
bundle_file="$out_dir/cli.js"
package_json_file="$out_dir/package.json"
readme_file="$out_dir/README.md"

echo "[--] Preparing $out_dir"
rm -rf $out_dir
mkdir -p $out_dir

echo "[--] Bundling $entry_file -> $bundle_file"
./node_modules/.bin/browserify --debug --node --no-bundle-external -o $bundle_file $entry_file
ls -sk $bundle_file

echo "[--] Making sure bundled file has interpreter comment"
if ! grep -q '#!/usr/bin/env node' $bundle_file; then
  sed -i '' '1s|^|#!/usr/bin/env node\'$'\n''|' $bundle_file
fi

echo "[--] Copying LICENSE"
cp LICENSE $out_dir/LICENSE

echo "[--] Parsing current helppo version"
helppo_version=$(cat package.json | grep '"version":' | sed -E 's/^ *"version": "([^"]+)",?$/\1/')
echo $helppo_version

echo "[--] Parsing available database library versions"
mysql_line=$(cat package.json | grep '"mysql":')
echo $mysql_line
pg_line=$(cat package.json | grep '"pg":')
echo $pg_line

echo "[--] Parsing other package.json lines"
engine_line=$(cat package.json | grep '"node":')

echo "[--] Creating $package_json_file"
echo "" > $package_json_file
echo '{
  "name": "helppo-cli",
  "version": "'$helppo_version'",
  "license": "GPL-3.0-only",
  "repository": "codeclown/helppo",
  "engines": {
   '$engine_line'
  },
  "main": "cli.js",
  "files": [
    "cli.js",
    "LICENSE",
    "LICENSE-3RD-PARTIES"
  ],
  "bin": {
    "helppo-cli": "cli.js"
  },
  "dependencies": {
   '$mysql_line'
   '$pg_line'
    "helppo": "'$helppo_version'"
  }
}' | tee $package_json_file

echo "[--] Creating $readme_file"
echo "" > $readme_file
echo '![Screenshot of Helppo CLI](docs/screenshots/cli_readme_banner.png)

# helppo-cli

> A command line utility to start a [Helppo](https://github.com/codeclown/helppo) instance from a connection string

## Usage

[Refer to the main package documentation](https://github.com/codeclown/helppo/blob/v'$helppo_version'/docs/CLI.md).

## License

See [LICENSE](./LICENSE)' | tee $readme_file

echo "[--] Done"
