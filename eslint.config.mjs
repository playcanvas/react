import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactCompiler from 'eslint-plugin-react-compiler'
import importPlugin from 'eslint-plugin-import';

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
      'import': importPlugin,
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts', '.json']
        }
      }
    },
    rules: {
      'react/prop-types': 'off',
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-compiler/react-compiler": "warn",
      'import/extensions': ['error', 'always', {
        js: 'always',
        ts: 'always',
      }],

      // Catch unresolved paths (e.g. typos or missing .js)
      'import/no-unresolved': 'error',
    },
  },
  {
    ignores: [
      "packages/*/dist/", 
      "packages/*/node_modules/",
      "packages/docs/public/",
      "packages/docs/.next/",             // Next.js build output
      "packages/docs/public/", 
    ],
  },
];