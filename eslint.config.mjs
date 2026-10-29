import react from '@playcanvas/eslint-config/react';
import typescript from '@playcanvas/eslint-config/typescript';
import reactCompiler from 'eslint-plugin-react-compiler';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...typescript,
    ...react,
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    {
        plugins: {
            'react-compiler': reactCompiler
        },
        rules: {
            'import-x/no-unresolved': ['error', { ignore: ['^@playcanvas/react(?:/|$)'] }],
            // false positives through memo(forwardRef(...)) and hook results named `props`
            'react/prop-types': 'off',
            'react-compiler/react-compiler': 'warn'
        }
    }
];
