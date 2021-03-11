<p align="center">
<img src="docs/screenshots/readme_logo.png" alt="Helppo" />
</p>
<p align="center">
<img src="docs/screenshots/readme_intro.gif" alt="Gif of helppo on the command line" width="500" />
</p>
<p align="center">
<a href="https://www.npmjs.com/package/helppo-cli"><img src="https://img.shields.io/badge/helppo--cli-fff?logo=npm" alt="helppo-cli on npm"></a>
<a href="https://github.com/codeclown/helppo"><img src="https://img.shields.io/badge/helppo-181717?logo=github" alt="Helppo on GitHub"></a>
<a href="https://hub.docker.com/r/codeclown/helppo"><img src="https://img.shields.io/badge/codeclown%2Fhelppo-ffffff?logo=docker" alt="Helppo on Docker Hub"></a>
</p>

# Helppo

> Instant admin UI for your database

Helppo is still in early development. Versions 0.X are published under GPLv3 (free forever; see [License](#license)).

**Feature highlights**

- Automatically reads database schema (supports custom configuration), prints human-readable column names
- Browse tables with filters, pagination, foreign key links, bulk actions/copy
- Edit rows with the help of date pickers, secret columns
- Run raw SQL queries
- Recover deleted rows if you haven't refreshed the page
- Shareable URLs for every page, filter and query

There's also some [screenshots](#screenshots).

## Table of Contents

<!-- hohhoijaa -->

- [Table of Contents](#table-of-contents)
- [Supported databases](#supported-databases)
- [Installation](#installation)
  - [npx](#npx)
  - [npm / yarn](#npm--yarn)
    - [Updating](#updating)
  - [Docker](#docker)
  - [`docker-compose`](#docker-compose)
  - [Express.js middleware](#expressjs-middleware)
- [Usage](#usage)
  - [Via connection string](#via-connection-string)
  - [Via knexfile](#via-knexfile)
  - [Via environment variable `DATABASE_URL`](#via-environment-variable-databaseurl)
  - [Without password](#without-password)
  - [`--help`](#--help)
- [Screenshots](#screenshots)
- [Docs](#docs)
- [Subscribe to Helppo news](#subscribe-to-helppo-news)
- [Contributing](#contributing)
- [License](#license)
  - [From v1.0 onwards](#from-v-onwards)

<!-- /hohhoijaa -->

## Supported databases

- Postgres
- MySQL

## Installation

### npx

If you have npm installed, you can just run `npx helppo-cli`, which will install the latest version and execute it:

```shell
$ npx helppo-cli ...
```

### npm / yarn

Install globally via npm or yarn:

```shell
$ npm install -g helppo-cli
$ yarn global add helppo-cli
# then:
$ helppo-cli ...
```

#### Updating

Commands to update installation later:

```shell
$ npm update -g helppo-cli
$ yarn global upgrade helppo-cli
```

### Docker

Use the official Docker image:

```shell
$ docker run --rm -e "DATABASE_URL=<connection_string>" -p 3000:3000 codeclown/helppo
```

### `docker-compose`

Sample template for use in `docker-compose.yml`:

```yaml
version: "3.1"
services:
  helppo:
    # note: it's recommended to change "latest" to a specific version when using in production
    image: codeclown/helppo:latest
    environment:
      DATABASE_URL: <connection_string>
    ports:
      - 3000:3000
```

### Express.js middleware

<a href="https://www.npmjs.com/package/helppo"><img src="https://img.shields.io/badge/helppo-fff?logo=npm" alt="helppo on npm"></a>

You can mount Helppo directly in your Express.js application. See [Middleware](docs/Middleware.md).

It also comes with the CLI utility, installed at `./node_modules/.bin/helppo-cli-local`.

## Usage

### Via connection string

The standard way to start a helppo instance is to give it a connection string as an argument.

```shell
$ helppo-cli mysql://user:pass@localhost:3306/my_db
Helppo is running. View it in your browser:
  http://localhost:3000
```

Then simply open the address in your browser. Helppo will bind to the first available port in the 3000-3999 range.

### Via knexfile

Helppo does not use knex, but it can parse connection details from a knexfile.

```shell
$ helppo-cli --knexfile path/to/knexfile.js
```

### Via environment variable `DATABASE_URL`

Helppo will grab a connection string from the environment variable `DATABASE_URL`, if present.

```shell
$ DATABASE_URL=mysql://user:pass@localhost:3306/my_db helppo-cli
```

### Without password

You can leave password out of the connection string. If authentication fails, helppo will prompt for a password:

```shell
$ helppo-cli mysql://user@localhost:3306/my_db
Access denied for user 'root'@'172.29.0.1' (using password: NO). Try password:
```

### `--help`

Run `helppo-cli --help` to print the available arguments and options.

```shell
$ helppo-cli --help
helppo-cli | Instant database management interface in your browser

USAGE
  helppo-cli <connection_string>
  helppo-cli --knexfile knexfile.js

ARGUMENTS
  connection_string           A database connection string, see below for
                              examples.

OPTIONS
  -h, --help                  Show this help message
      --knexfile knexfile.js  Parse connection details from a knexfile
      --no-color              Disable colors in terminal output

ENVIRONMENT VARIABLES
  If DATABASE_URL is defined, it will be used.

EXAMPLES
  $ helppo-cli mysql://user:pass@localhost:3306/my_db
  $ helppo-cli postgres://user:pass@localhost:5432/my_db
  $ helppo-cli --knexfile src/knexfile.js
  $ DATABASE_URL=mysql://user:pass@localhost:3306/my_db helppo-cli
```

## Screenshots

| <strong>Browse database tables</strong><br>![Browse database tables](docs/screenshots/readme_browse_table.png) | <strong>Perform bulk actions</strong> <br>![Perform bulk actions](docs/screenshots/readme_batch_operations.png) |
| :------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------: |
|       <strong>Edit database rows</strong><br>![Edit database rows](docs/screenshots/readme_edit_row.png)       |      <strong>Run raw SQL queries</strong><br>![Run raw SQL queries](docs/screenshots/readme_raw_query.png)      |

## Docs

See [`docs/README.md`](/docs/README.md) for documentation related to the middleware, development, etc.

## Subscribe to Helppo news

If you'd like to receive periodic updates about the status of Helppo, subscribe to the [mailing list](https://helppo.dev).

## Contributing

Please do file bug reports and feature requests as [issues](https://github.com/codeclown/helppo/issues) in this GitHub repository!

For more information, see [Contributing.md](./docs/Contributing.md).

## License

Versions 0.X of Helppo are published under the GPLv3 license.

Paraphrased, it means that **you can use Helppo in any project for free, as long as you retain the license text in the source code** (in the case of a server-side npm package like Helppo, this requirement is automatically fulfilled when installing it via npm, as the license text is always included in the node_modules subfolder). Additionally, if you modify Helppo itself and publish the modified software, it must be published under the same license.

For full license terms, see [LICENSE](./LICENSE).

### From v1.0 onwards

I plan on adding or changing to a commercial license from v1.0 onwards, if it seems sensible at that point (considering project traction, feature backlog, etc.). Versions that were released under GPL will of course remain available under GPL indefinitely. To keep up with the topic, subscribe to the [mailing list](https://helppo.dev).
