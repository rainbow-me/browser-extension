import path from 'path';

import { UserConfig } from 'vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./**/**/*.test.ts'],
    testTimeout: 90_000,
    watch: false,
    retry: 2,
    bail: 1,
    hookTimeout: 35_000,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '../src'),
    },
  },
}) as UserConfig;
