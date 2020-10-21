module.exports = {
  extends: ["stylelint-config-standard", "stylelint-config-prettier"],
  rules: {
    // Only allow multi-line declarations.
    //   Allowed:
    //     .foobar {
    //       text-decoration: underline;
    //     }
    //   Not allowed:
    //     .foobar { text-decoration: underline; }
    "declaration-block-single-line-max-declarations": 0,

    // TODO
    // All classes defined should be prefixed by the name of that file.
    //   Allowed in Navigation.css:
    //     .Navigation {
    //       text-decoration: underline;
    //     }
    //     .Navigation-foobar {
    //       text-decoration: underline;
    //     }
    //   Not allowed in Navigation.css:
    //     .foobar {
    //       text-decoration: underline;
    //     }
    // Can't be done without lots of hacking currently. Could be possible in the future
    // via `.overrides`, see https://github.com/stylelint/stylelint/issues/3128.
    // 'selector-class-pattern': /foo/
  },
};
