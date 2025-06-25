import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactCompiler from 'eslint-plugin-react-compiler'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      }
    },
    rules: {
      'react/prop-types': 'off',
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-compiler/react-compiler": "warn"
    },
  }
];