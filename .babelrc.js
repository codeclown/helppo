module.exports = {
  overrides: [
    {
      test: "src/server",
      presets: [
        [
          "@babel/env",
          {
            targets: {
              node: 10,
            },
          },
        ],
        "@babel/preset-typescript",
      ],
    },
    {
      test: "src/client",
      presets: [
        [
          "@babel/env",
          {
            targets: "> 0.25%, not dead",
          },
        ],
      ],
      plugins: [
        [
          "@babel/plugin-transform-runtime",
          {
            regenerator: true,
          },
        ],
      ],
    },
  ],
};
