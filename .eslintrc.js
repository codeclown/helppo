module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  ignorePatterns: ["dist/"],
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
  plugins: ["filenames", "@typescript-eslint"],
  rules: {
    "filenames/match-exported": "error",
    "filenames/no-index": "error",
    "import/extensions": "error",
    "no-console": "warn",
  },
  overrides: [
    {
      files: ["**/*.ts"],
      extends: ["plugin:@typescript-eslint/recommended"],
    },
    {
      files: ["**/*.spec.*", "src/server/drivers/driverSpec.*"],
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
