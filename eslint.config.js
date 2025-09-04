// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
    {
    files: ["app/(core)/assistant/**/*.{ts,tsx}"],
    rules: {
      "react/no-unknown-property": "off",
    },
  },
]);
