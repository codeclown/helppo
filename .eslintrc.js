module.exports = {
  extends: ["eslint:recommended", "prettier"],
  ignorePatterns: ["dist/", "__snapshots__"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: false,
    },
  },
  env: {
    es6: true,
    node: true,
  },
  plugins: ["filenames"],
  rules: {
    "filenames/match-exported": 2,
    "filenames/no-index": 2,
  },
  overrides: [
    {
      files: ["**/*.spec.js", "src/server/drivers/driverSpec.js"],
      env: {
        mocha: true,
      },
      extends: ["plugin:mocha/recommended"],
      rules: {
        "mocha/no-mocha-arrows": "off",
        "mocha/no-hooks-for-single-case": "off",
      },
    },
    {
      files: ["src/client/**/*.js"],
      env: {
        node: false,
        browser: true,
      },
    },
  ],
};
