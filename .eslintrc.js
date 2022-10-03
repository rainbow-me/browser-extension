// eslint-disable-next-line no-undef
module.exports = {
  extends: ['rainbow', 'plugin:prettier/recommended'],
  root: true,
  rules: {
    'prettier/prettier': [
      'error',
      {
        arrowParens: 'always',
        endOfLine: 'lf',
        printWidth: 80,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'all',
      },
    ],
  },
};
