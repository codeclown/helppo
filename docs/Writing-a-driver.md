# Writing a driver

A Helppo drives exposes a predefined interface which Helppo can use to query the database.

## Table of Contents

<!-- hohhoijaa -->

- [Table of Contents](#table-of-contents)
- [Example driver: `helppo-driver-mysql`](#example-driver-helppo-driver-mysql)
- [Automated tests](#automated-tests)

<!-- /hohhoijaa -->

## Example driver: `helppo-driver-mysql`

Look at the source code of `helppo-driver-mysql` to get an idea of a working driver. Basically, a driver is an object containing a few specific functions. At the time of writing those functions are:

```js
getSchema();
getTableRows(tableName, columnNames, browseOptions);
saveRow(table, rowId, row);
```

## Automated tests

Any Helppo driver should pass the driver test suite, which can be found at `packages/helppo-driver-utils/runHelppoDriverTests.js`.

Refer to `packages/helppo-driver-mysql/set/driver.spec.js` to see how it is used.
