import { defineConfig } from 'vitest/config';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    include: ['./**/*.test.ts'],
    testTimeout: 20_000,
    watch: false,
  },
});
