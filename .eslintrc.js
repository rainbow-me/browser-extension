// eslint-disable-next-line no-undef
module.exports = {
  extends: ['rainbow', 'plugin:prettier/recommended'],
  plugins: ['boundaries'],
  root: true,
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
  },
  settings: {
    'boundaries/elements': [
      {
        type: 'entry-popup',
        pattern: 'src/entries/popup/**',
      },
      {
        type: 'entry-content',
        pattern: 'src/entries/content/**',
      },
      {
        type: 'entry-inpage',
        pattern: 'src/entries/inpage/**',
      },
      {
        type: 'entry-background',
        pattern: 'src/entries/background/**',
      },
      {
        type: 'core-keychain',
        pattern: 'src/core/keychain/**',
      },
      {
        type: 'core-state',
        pattern: 'src/core/state/**',
      },
    ],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            // Only background is allowed to interact with keychain
            from: ['entry-background'],
            allow: ['core-keychain'],
          },
          {
            // Only popup and background are allowed to interact with stores.
            from: ['entry-popup', 'entry-background'],
            allow: ['core-state'],
          },
          {
            // Keychain uses stores.
            from: ['core-keychain'],
            allow: ['core-state'],
          },
        ],
      },
    ],
    'no-nested-ternary': 'off',
    'import/no-default-export': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/order': [
      'warn',
      {
        alphabetize: {
          order: 'asc',
        },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        pathGroups: [
          {
            group: 'internal',
            pattern: '~/**',
          },
        ],
      },
    ],
    'sort-imports': [
      'warn',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],
    'prettier/prettier': ['warn', require('./.prettierrc.js')],
  },
};
