import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "front-end/**"],
  },
  js.configs.recommended,
  {
    files: ["back-end/**/*.js", "scripts/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
