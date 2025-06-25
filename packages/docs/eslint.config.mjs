import baseConfig from '../../eslint.config.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: [
      "dist/", 
      "node_modules/", 
      "public/",
      ".next/",             // Next.js build output
    ],
  },
];