// eslint-disable-next-line no-undef
module.exports = {
  extends: ['rainbow', 'plugin:prettier/recommended'],
  root: true,
  rules: {
    'import/no-default-export': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/order': [
      'error',
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
    'prettier/prettier': ['error', require('./.prettierrc.js')],
  },
};
