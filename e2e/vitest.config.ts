import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./**/*.test.ts'],
    testTimeout: 20_000,
    watch: false,
  },
});
