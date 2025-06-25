import baseConfig from '../../eslint.config.mjs';
import importPlugin from 'eslint-plugin-import';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    plugins: {
      'import': importPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts', '.json']
        }
      }
    },
    rules: {
      'import/extensions': ['error', 'ignorePackages', {
        js: 'always',
        ts: 'always',
        tsx: 'always',
      }]
    }
  },
  {
    ignores: [
      "dist/", 
      "node_modules/", 
    ],
  },
];