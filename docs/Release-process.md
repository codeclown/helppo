# Release process

## Table of Contents

<!-- hohhoijaa -->

- [Table of Contents](#table-of-contents)
- [Prerequisites](#prerequisites)
- [Prepare and merge changes to master](#prepare-and-merge-changes-to-master)
  - [Update Changelog](#update-changelog)
  - [(Optional) Build and run all tests](#optional-build-and-run-all-tests)
  - [Create and merge PR](#create-and-merge-pr)
  - [Wait until master is green](#wait-until-master-is-green)
  - [Switch to master and pull](#switch-to-master-and-pull)
- [Publish `helppo` to NPM](#publish-helppo-to-npm)
  - [Publish the package](#publish-the-package)
- [Publish `helppo-cli` to NPM](#publish-helppo-cli-to-npm)
  - [Prepare package files](#prepare-package-files)
  - [Publish the package](#publish-the-package-1)
- [Push changes to repository](#push-changes-to-repository)
- [Publish the docker image](#publish-the-docker-image)

<!-- /hohhoijaa -->

## Prerequisites

The following commands are ran in the repository root, unless otherwise noted.

## Prepare and merge changes to master

Working in a version branch (e.g. `vX.X.X-branch`), unless otherwise noted.

### Update Changelog

In [`Changelog.md`](./Changelog.md), add a new section for this version and move everything from "Unreleased" to it.

Make a commit with the changes before continuing.

### (Optional) Build and run all tests

… if you want to check locally that they pass.

```bash
yarn ci
```

### Create and merge PR

- Create PR if not already exists
- Merge the PR after CI is green

### Wait until master is green

Wait until CI is green in master.

### Switch to master and pull

```bash
git checkout master
git pull
```

## Publish `helppo` to NPM

### Publish the package

Publish to NPM:

```bash
yarn publish # will prompt for new version number
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

## Push changes to repository

Don't forget to push w/ tags.

```bash
git push --follow-tags
```

## Publish the docker image

Run the following script which outputs all the commands preformatted. The script does not build or push any images, it just prints instructions.

```bash
yarn docker-build-info
```

Output will be similar to this:

```
Run the following commands in order:
  docker build -t codeclown/helppo:0.4.4 -t codeclown/helppo:latest --build-arg HELPPO_CLI_VERSION=0.4.4 .
  docker run --rm codeclown/helppo:0.4.4 --help # should see help message
  docker push codeclown/helppo:0.4.4 && docker push codeclown/helppo:latest
```

Follow the commands one by one.
