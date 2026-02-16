// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ESLint } = require('eslint');

const removeIgnoredFiles = async (files) => {
  const eslint = new ESLint();
  const isIgnored = await Promise.all(
    files.map((file) => eslint.isPathIgnored(file)),
  );
  return files.filter((_, i) => !isIgnored[i]);
};

module.exports = {
  '*.{js,jsx}': async (files) => {
    const filesToLint = await removeIgnoredFiles(files);
    if (filesToLint.length === 0) return [];
    return [`eslint --fix --cache --max-warnings 0 ${filesToLint.join(' ')}`];
  },
  '*.{ts,tsx}': [
    () => 'tsc --skipLibCheck --noEmit',
    async (files) => {
      const filesToLint = await removeIgnoredFiles(files);
      if (filesToLint.length === 0) return [];
      return [
        `eslint --fix --cache --max-warnings 0 --ignore-pattern '!*.d.ts' ${filesToLint.join(
          ' ',
        )}`,
      ];
    },
  ],
};
