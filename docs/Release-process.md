# Release process

## Table of Contents

<!-- hohhoijaa -->

- [Table of Contents](#table-of-contents)
- [Prerequisites](#prerequisites)
- [Publish `helppo` to NPM](#publish-helppo-to-npm)
  - [Build and run all tests](#build-and-run-all-tests)
  - [Publish the package](#publish-the-package)
- [Publish `helppo-cli` to NPM](#publish-helppo-cli-to-npm)
  - [Prepare package files](#prepare-package-files)
  - [Publish the package](#publish-the-package-1)

<!-- /hohhoijaa -->

## Prerequisites

The following commands are ran in the repository root, unless otherwise noted.

## Publish `helppo` to NPM

### Build and run all tests

```bash
yarn ci
```

### Publish the package

Publish to NPM:

```bash
yarn publish # will prompt for new version number
```

Push w/ tags:

```bash
git push --follow-tags
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
yarn --cwd src/server/cli/dist publish
```
