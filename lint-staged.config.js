module.exports = {
  '*.{js,jsx}': ['eslint --cache --fix'],
  '*.{ts,tsx}': [() => 'tsc --skipLibCheck --noEmit', 'eslint --cache --fix'],
};
