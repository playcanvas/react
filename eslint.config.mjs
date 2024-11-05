import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
    rules: {
      "react/jsx-uses-react": "off",      // Not needed with React 17+ JSX Transform
      "react/react-in-jsx-scope": "off",  // Not needed with React 17+ JSX Transform
    },
  },
  {
    ignores: ["packages/lib/dist/", "packages/examples/dist/", "packages/lib/node_modules/"],
  }
];