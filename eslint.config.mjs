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
            'react/prop-types': 'off',
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react-compiler/react-compiler': 'warn'
        }
    }
];
