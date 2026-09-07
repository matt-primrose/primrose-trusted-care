import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    // .mjs too: scripts/ uses that extension and otherwise gets linted without
    // Node globals, so every process/console reference reports as no-undef.
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  {
    ignores: ['**/node_modules/', '**/dist/', '**/.angular/', 'client/**', 'coverage/'],
  },
];
