/* eslint-env node */
module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    ignorePatterns: ['dist/*'],
    rules: {
        'react-hooks/exhaustive-deps': ['warn', {
            additionalHooks: '(useGameStats|useLiveQuery)'
        }]
    }
};