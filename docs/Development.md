# Development

## Table of Contents

<!-- hohhoijaa -->

- [Table of Contents](#table-of-contents)
- [Read this first!](#read-this-first)
- [Code style, linting, etc.](#code-style-linting-etc)
- [Set up a local development environment](#set-up-a-local-development-environment)
  - [Starting databases via docker](#starting-databases-via-docker)
- [Local development server](#local-development-server)
  - [Prerequisites](#prerequisites)
  - [Seed data](#seed-data)
  - [Start the watch-mode](#start-the-watch-mode)
    - [Start the dev server against a different database](#start-the-dev-server-against-a-different-database)
    - [Example open source projects for testing](#example-open-source-projects-for-testing)
- [Run tests](#run-tests)
  - [Prerequisites](#prerequisites-1)
  - [Run tests](#run-tests-1)
  - [Lint](#lint)
- [Dependencies and their licenses](#dependencies-and-their-licenses)
  - [Allowed licenses for third-party dependencies](#allowed-licenses-for-third-party-dependencies)
  - [Third-party license notice](#third-party-license-notice)
- [Managing documentation](#managing-documentation)
- [Release process](#release-process)

<!-- /hohhoijaa -->

## Read this first!

The following paragraphs answer questions you might have when getting started.

**JavaScript** files are contained inside `src/`. They are linted via eslint (run `yarn lint:js`). Only standard ES syntax is allowed. Upon build-time the files are compiled via babel into `build/` to ensure compatibility with `require`.

**Tests** are contained inside `src/` adjacent to the source files (e.g. `App.js` and `App.spec.js`).

**CSS** files are contained inside `src/` adjacent to the source files (e.g. `Navigation.js` and `Navigation.css`). Upon build-time they are concatenated into one large CSS file. They are also linted (run `yarn lint:css`). There is also `base.css` which defines global styles and CSS variables.

**Documentation** files are contained inside `docs/`. Contributing to documentation is encouraged.

**Dependencies** for the client bundle are listed under `devDependencies`. Only server-side dependencies are needed under `dependencies`.

**Do I need X?** You need _git_ for version control, _yarn_ for running stuff and _Docker_ for running tests. That should be it.

## Code style, linting, etc.

Code style and formatting is automatically ensured via:

- eslint
- Prettier

It's recommended to take advantage of this automation by installing the appropriate plugins in your editor of choice, if you haven't already.

Optionally, install an IDE plugin (such as https://github.com/frigus02/vscode-sql-tagged-template-literals) to take advantage of `/*sql*/` comments scattered around the driver code.

## Set up a local development environment

Pull the repository:

```bash
git clone git@github.com:codeclown/helppo.git
cd helppo/
```

Install dependencies for all packages:

```bash
yarn
```

### Starting databases via docker

For running the dev server and tests, it is most convenient to start the required database engines via Docker.

Start docker containers, etc. via the command:

```bash
docker-compose up -d
```

The various databases are bound to port range 7810-7819, so it's very unlikely they would collide with any other port you have in use.

If you're unfamiliar with docker, the above command can be cleaned up (all created resources will be removed) via docker-compose:

```bash
docker-compose down
```

## Local development server

The quickest way to get started with development is to start the dev server which is included in this repository (located at `src/server/testServer`).

### Prerequisites

See [Starting databases via docker](#starting-databases-via-docker).

### Seed data

The dev server database is seeded with some tables and content, for faster development.

The seed data file can be found at `src/server/devServer/devServerSeed.sql`.

If you need to reset the database to the original seed data, just recreate the database via `docker-compose down && docker-compose up -d`.

### Start the watch-mode

Running the following command will start the dev server which restarts when you make changes to any file:

```shell
$ yarn dev
...
Helppo is running. View it in your browser:
  http://localhost:3000
```

#### Start the dev server against a different database

If you want to start the dev server against another database, simply supply the connection string:

```shell
$ yarn dev postgres://postgres:example@localhost:5100/postgres
```

Under the hood it's using [helppo-cli](CLI.md).

#### Example open source projects for testing

See [`src/server/devServer/example-projects/README.md`](./src/server/devServer/example-projects/README.md) for some sample docker-compose files that can be used to spin up open source projects for testing purposes.

## Run tests

Test files can be found adjacent to the files they test. They are prefixed with `.spec.js`.

### Prerequisites

See [Starting databases via docker](#starting-databases-via-docker).

### Run tests

The following command runs all tests:

```bash
yarn test
```

Limit the tests to run via usual mocha grepping:

```bash
yarn test -g "full schema"
```

### Lint

The following command lints the codebase.

```bash
yarn lint
```

## Dependencies and their licenses

### Allowed licenses for third-party dependencies

Because certain derivatives of the Helppo codebase may be released under proprietary and copyleft licenses in the future (see [From v1.0 onwards](../README.md#from-v10-onwards)), special care should be taken when including third-party dependencies, to ensure that no third-party licenses are violated.

The following licenses are known to be compliant, and dependencies under these licenses can be included in Helppo:

- MIT
- ISC
- Zlib
- BSD-0-Clause
- BSD-2-Clause
- BSD-3-Clause
- Apache-2.0
- CC0-1.0
- CC-BY-3.0
- CC-BY-4.0
- WTFPL

### Third-party license notice

Additionally, care must be taken that appropriate third-party license notices are present in distributed software.

For when a dependency is `require()`'d or `import()`'ed (i.e. linking) directly from node_modules, there is no need for extra measures. Packages under node_modules/ include their own license notice inside each package sub-directory.

For when a dependency is bundled, using browserify, into one of the front-end bundles that are then distributed as part of Helppo, it must be ensured that their license notices are included in the file `LICENSE-3RD-PARTIES`.

Keeping the file up-to-date is automated, via `browserify-plugin-license-notice`. Running `yarn build` should update the file with the latest dependencies, if any new were added.

The previously mentioned browserify plugin also includes a CLI tool to update the file. For when needed:

```shell
$ ./node_modules/.bin/browserify-bundle-license-notice dist/client/client.js > LICENSE-3RD-PARTIES
```

As an added measure, in the CI steps the same binary is ran in "CI mode", which means that if the file is out-dated, the build shall fail.

## Managing documentation

Public documentation is located at [`docs/`](./).

All markdown files contain a Table of Contents which is updated automatically using the `hohhoijaa` script. Update them automatically by running:

```bash
yarn docs:build
```

## Release process

See [Release process](Release-process.md).
