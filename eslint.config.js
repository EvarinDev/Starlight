const pluginJs = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json"
      },
    },
  }
];