import globals from "globals";
import typescriptConfig from "@playcanvas/eslint-config/typescript";
import reactConfig from "@playcanvas/eslint-config/react";
import reactCompiler from "eslint-plugin-react-compiler";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // shared tiers: /react is additive-only and spread on top of /typescript
  ...typescriptConfig,
  ...reactConfig,

  // repo-specific (preserved):
  // browser globals — this is a React browser renderer; /typescript only sets node globals
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },

  // eslint-plugin-react-compiler is NOT bundled by /react, so it stays repo-specific
  {
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      "react/prop-types": "off",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-compiler/react-compiler": "warn",
    },
  },
];
