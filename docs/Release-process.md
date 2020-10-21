# Release process

## Table of Contents

<!-- hohhoijaa -->

- [Table of Contents](#table-of-contents)
- [Prerequisites](#prerequisites)
- [Publish `helppo` to NPM](#publish-helppo-to-npm)
  - [Build](#build)
  - [Run all tests](#run-all-tests)
  - [Publish the package](#publish-the-package)
- [Publish `helppo-cli` to NPM](#publish-helppo-cli-to-npm)
  - [Prepare package files](#prepare-package-files)
  - [Publish the package](#publish-the-package-1)

<!-- /hohhoijaa -->

## Prerequisites

The following commands are ran in the repository root, unless otherwise noted.

## Publish `helppo` to NPM

### Build

```bash
yarn build
```

### Run all tests

```bash
yarn ci
```

### Publish the package

Bump version:

```bash
yarn version # will prompt for new version number
```

Publish to NPM:

```bash
yarn publish
```

Push updated tags:

```bash
git push --tags
```

## Publish `helppo-cli` to NPM

With each release of `helppo`, a matching `helppo-cli` release should be made. Continue with this process after you completed the previous section.

The helppo-cli release process is divided into two parts.

### Prepare package files

The following script builds a ready-to-publish package into `src/server/cli/dist`:

```bash
yarn cli-package:prepare
```

This script is non-destructive as it only creates new files inside the aforementioned directory; you can run it as many times as you want, and inspect the outputs.

### Publish the package

Only continue to this step once you have verified that the previous step produced outputs as desired.

Cd to the directory and publish the package (no need to run `yarn version`, because version was already parsed from main `helppo` package):

```bash
cd src/server/cli/dist
yarn publish
```
