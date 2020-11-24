# Changelog

All notable changes to this project will be documented in this file.

For a complete list of changes refer to the commit history between versions. Internal changes and refactorings are not mentioned in this document.

## Unreleased

Changes to be released in an upcoming release:

-

## 0.4.0 - 2020-11-24

### Added

- Wildcard search of any text-based column (see [#9](https://github.com/codeclown/helppo/issues/9) for screenshot)
- CLI: New `--knexfile` option
- CLI: Support `DATABASE_URL` environment variable
- Better 404-views

### Fixed

- Switched to using connection pools instead of single connections. This allows for better performance and control for users of the middleware, and the possibility of using transactions in the future if needed.
- Improved future maintainability by converting most of the JavaScript codebase to TypeScript.

## 0.3.1 - 2020-11-01

### Fixed

- Fix an React key error being logged to the console

## 0.3.0 - 2020-10-29

### Added

- Show related row information when hovering a foreign key value (see [#6](https://github.com/codeclown/helppo/issues/6) for screenshot)
- Show related rows on Edit row -page (see [#7](https://github.com/codeclown/helppo/issues/7) for screenshot)
- Make SQL editor vertically resizable (see [#5](https://github.com/codeclown/helppo/issues/5) for screenshot)
- Implement Schema-page (see [#4](https://github.com/codeclown/helppo/issues/4) for screenshot)
- Add a loading spinner to views where loading happens

## 0.2.1 - 2020-10-27

### Fixed

- Fix an issue where table cells could show an extraneous "0" next to the column value ()

## 0.2.0 - 2020-10-26

### Added

- Implement columnType-specific Add filter -dropdown (see [#1](https://github.com/codeclown/helppo/issues/1) for screenshot)
- Implement Copy results -button to Query-page (see [#2](https://github.com/codeclown/helppo/issues/2) for screenshot)
- Add elementary type definition for HelppoMiddleware

### Changed

- Implement Server Error page
- Render error page if `config.driver` is missing
- Render error page if database connection has been closed
- Uniform env-aware error handling

## 0.1.6 - 2020-10-23

**This is the first public release of Helppo.** Versions from 0.1.0 to 0.1.5 were minor fixes to resolve packaging issues.
