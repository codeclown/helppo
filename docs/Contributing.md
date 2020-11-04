# Contributing

## Table of Contents

<!-- hohhoijaa -->

- [Table of Contents](#table-of-contents)
- [Bug Reports, Feature Ideas](#bug-reports-feature-ideas)
- [Pull Requests](#pull-requests)
  - [Allowed licenses for third-party dependencies](#allowed-licenses-for-third-party-dependencies)
    - [Third-party license notice](#third-party-license-notice)
- [Setting up a local development environment](#setting-up-a-local-development-environment)

<!-- /hohhoijaa -->

Thank you for your interest in contributing to Helppo!

## Bug Reports, Feature Ideas

Please do raise issues here on GitHub issue tracker. All of the following are very welcome:

- Bug reports
- Feature idea / request

Please search the open issues first to see if there is an existing issue for your use case already.

## Pull Requests

Pull Requests are accepted through GitHub. Before filing a PR it's _recommended to create an Issue first_ to discuss the proposal with the maintainers.

Please be aware of the [GitHub Terms of Service](https://github.com/site/terms), especially the following sections:

- [D3. Ownership of Content, Right to Post, and License Grants](https://github.com/site/terms#3-ownership-of-content-right-to-post-and-license-grants)
- [D6. Contributions Under Repository License](https://github.com/site/terms#6-contributions-under-repository-license)

Meaning, paraphrased: that by submitting a PR you assert that you have the rights to submit the contents of your PR, and that, while you retain copyright of your content, you agree to your content being licensed under the same terms as the repository license.

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

#### Third-party license notice

Additionally, care must be taken that appropriate third-party license notices are present in distributed software.

For when a dependency is `require()`'d or `import()`'ed (i.e. linking) directly from node_modules, there is no need for extra measures. Packages under node_modules/ include their own license notice inside each package sub-directory.

For when a dependency is bundled, using browserify, into one of the front-end bundles that are then distributed as part of Helppo, it must be ensured that their license notices are included in the file `LICENSE-3RD-PARTIES`.

Keeping the file up-to-date is automated, via `browserify-plugin-license-notice`. Running `yarn build` should update the file with the latest dependencies, if any new were added.

The previously mentioned browserify plugin also includes a CLI tool to update the file. For when needed:

```shell
$ ./node_modules/.bin/browserify-bundle-license-notice dist/client/client.js > LICENSE-3RD-PARTIES
```

As an added measure, in the CI steps the same binary is ran in "CI mode", which means that if the file is out-dated, the build shall fail.

## Setting up a local development environment

See [`Development.md`](./Development.md).
