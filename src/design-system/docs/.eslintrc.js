module.exports = {
  root: true,
  extends: ['rainbow', 'next/core-web-vitals'],
  plugins: ['prettier'],
  rules: {
    'import/no-default-export': 'off',
    'react/jsx-props-no-spreading': 'off',
    'prettier/prettier': ['error', require('./.prettierrc.js')],
  },
};
