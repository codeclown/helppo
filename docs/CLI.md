![Screenshot of Helppo CLI](screenshots/cli_readme_banner.png)

<p align="center">
<a href="https://www.npmjs.com/package/helppo-cli"><img src="https://img.shields.io/badge/npm-helppo--cli-blue" alt="helppo-cli on npm" /></a>
</p>

# Helppo CLI

> CLI tool to instantly spin up a graphical in-browser CRUD interface from a database connection string

## Quickstart

If you have npm installed, just run:

```
$ npx helppo-cli <connection_string>
Helppo is running. View it in your browser:
  http://localhost:3000
```

For more information and installation methods, continue reading.

## Table of Contents

<!-- hohhoijaa -->

- [Quickstart](#quickstart)
- [Table of Contents](#table-of-contents)
- [Supported databases](#supported-databases)
- [Usage](#usage)
  - [Connect to a database via connection string](#connect-to-a-database-via-connection-string)
  - [Password prompt](#password-prompt)
  - [Manual](#manual)
- [Installation](#installation)
  - [Using via `npx`](#using-via-npx)
  - [Installing globally](#installing-globally)
    - [Updating](#updating)
  - [Bundled with `helppo`](#bundled-with-helppo)
  - [Installing as a dependency](#installing-as-a-dependency)
- [License](#license)

<!-- /hohhoijaa -->

## Supported databases

- Postgres
- MySQL

## Usage

### Connect to a database via connection string

```shell
$ helppo-cli mysql://user:pass@localhost:3306/my_db
Helppo is running. View it in your browser:
  http://localhost:3000
```

### Password prompt

Will prompt for password if authentication fails:

```shell
$ helppo-cli mysql://user@localhost:3306/my_db
Access denied for user 'root'@'172.29.0.1' (using password: NO). Try password:
```

### Manual

Run `helppo-cli` or `helppo-cli --help` to print the available arguments and options.

```shell
$ helppo-cli --help
helppo-cli | Instant database management interface in your browser

USAGE
  helppo-cli <connection_string>

ARGUMENTS
  connection_string     A database connection string, see below for examples.

OPTIONS
  -h, --help            Show this help message
      --no-color        Disable colors in terminal output

EXAMPLES
  $ helppo-cli mysql://user:pass@localhost:3306/my_db
  $ helppo-cli postgres://user:pass@localhost:5432/my_db
```

## Installation

### Using via `npx`

The easiest way to run `helppo-cli` is via [`npx`](https://blog.npmjs.org/post/162869356040/introducing-npx-an-npm-package-runner):

```bash
$ npx helppo-cli
```

npx will install the package globally and execute it. Subsequent runs will be faster, as it only needs to be installed once.

### Installing globally

You can also install `helppo-cli` globally using npm or yarn:

```bash
npm install -g helppo-cli
# or
yarn global add helppo-cli
```

Then you can run it from any directory:

```bash
$ helppo-cli
```

#### Updating

Updating a globally installed package:

```bash
npm update -g helppo-cli
# or
yarn global upgrade helppo-cli
```

### Bundled with `helppo`

If you have `helppo` in your project dependencies, `helppo-cli` is already installed along with it.

The binary is called `helppo-cli-local` (located at `./node_modules/.bin` like any other dependency binary).

You can run it directly:

```bash
$ ./node_modules/.bin/helppo-cli-local
```

Or use it in scripts in `package.json`:

```json
"scripts": {
  "debug": "helppo-cli-local ..."
}
```

### Installing as a dependency

> **Note!** You don't need to do this if you already have `helppo` as a dependency. See [Bundled with `helppo`](#bundled-with-helppo).

You can also install `helppo-cli` as a regular dependency:

```bash
npm install --save-dev helppo-cli
# or
yarn add --dev helppo-cli
```

Then you can run it directly:

```bash
$ ./node_modules/.bin/helppo-cli
```

Or use it in scripts in `package.json`:

```json
"scripts": {
  "debug": "helppo-cli ..."
}
```

## License

See [`LICENSE`](../LICENSE.md) in the repository root, and for added information see License-section in the repository [`README.md`](../README.md).
