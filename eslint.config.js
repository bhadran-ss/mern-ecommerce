import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["front-end/**", "node_modules/**"],
  },
  {
    files: ["back-end/**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.node,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
