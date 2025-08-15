// eslint-disable-next-line no-undef
module.exports = {
  extends: ['rainbow', 'plugin:prettier/recommended'],
  root: true,
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
  },
  rules: {
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
