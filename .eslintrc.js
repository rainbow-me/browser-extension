// eslint-disable-next-line no-undef
module.exports = {
  extends: ['rainbow', 'plugin:prettier/recommended'],
  root: true,
  rules: {
    'prettier/prettier': ['error', require('./.prettierrc.js')],
  },
};
