# Drivers

## Table of Contents

<!-- hohhoijaa -->

- [Table of Contents](#table-of-contents)
- [Available drivers](#available-drivers)
  - [How to use](#how-to-use)
- [How it works](#how-it-works)
  - [Why are drivers per-library and not per-engine?](#why-are-drivers-per-library-and-not-per-engine)
- [Custom driver](#custom-driver)

<!-- /hohhoijaa -->

## Available drivers

These are the ones available currently:

| database engine | npm database library                                  | driver                                 |
| --------------- | ----------------------------------------------------- | -------------------------------------- |
| MySQL           | [`mysql`](https://www.npmjs.com/package/mysql) on npm | `import { MysqlDriver } from "helppo"` |
| PostgreSQL      | [`pg`](https://www.npmjs.com/package/pg) on npm       | `import { PgDriver } from "helppo"`    |

### How to use

See [Configuration.md](./Configuration.md#driver).

## How it works

Helppo drivers are simple wrappers around NodeJS database libraries. Helppo does not connect to your database; it just uses a connection you provide.

### Why are drivers per-library and not per-engine?

Because installing Helppo should not add another database library as a dependency to your application.

For example, if you already use [`mysql2`](https://www.npmjs.com/package/mysql2), and Helppo then used [`mysql`](https://www.npmjs.com/package/mysql), your dependency tree would contain both of them after installing Helppo, which is unnecessary. This way Helppo also does not care about database credentials; you establish the connection from whatever configuration you have, and pass it on to Helppo.

## Custom driver

Refer to [Writing a driver](Writing-a-driver.md) for information on how to write a Helppo driver for your database engine.
