import importPlugin from 'eslint-plugin-import';

import baseConfig from '../../eslint.config.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...baseConfig,
    {
        plugins: {
            import: importPlugin
        },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.ts', '.json']
                }
            }
        },
        rules: {
            'import/extensions': [
                'error',
                'ignorePackages',
                {
                    js: 'always',
                    ts: 'always'
                }
            ]
        }
    },
    {
        ignores: ['dist/', 'node_modules/']
    }
];
