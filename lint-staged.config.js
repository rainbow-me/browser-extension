module.exports = {
  '*.{js,jsx}': ['eslint --fix --cache --max-warnings 0'],
  '*.{ts,tsx}': [
    () => 'tsc --skipLibCheck --noEmit ',
    "eslint --fix --cache --max-warnings 0 --ignore-pattern '!*.d.ts'",
  ],
};
