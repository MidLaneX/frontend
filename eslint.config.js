import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      // Override all rule severities to warnings
      "eslint.severity": "warn"
    },
    rules: {
      // Convert ALL errors to warnings
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "no-useless-catch": "warn",
      "no-case-declarations": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-refresh/only-export-components": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "no-constant-condition": "warn",
      "no-empty": "warn",
      "no-fallthrough": "warn",
      "no-prototype-builtins": "warn",
      "prefer-const": "warn",
      "no-var": "warn",
    },
  },
]);
