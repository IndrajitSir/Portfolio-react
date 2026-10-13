import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
    {
        // OriginKit is a vendored, third-party component drop: its raw
        // WebGL/three.js plumbing leans on `any` for GL programs, buffers and
        // heterogeneous GeoJSON nodes. Rewriting that interior for a style
        // rule would risk a library we don't own for no runtime benefit, so
        // only `no-explicit-any` is relaxed — and only for this directory.
        // Everything else (unused vars, hook deps, error handling) stays
        // enforced, and the project's own code is linted strictly as before.
        files: ['src/components/originkit/**/*.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    }
);
