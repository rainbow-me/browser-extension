import path from 'path';

import { UserConfig } from 'vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./**/**/*.test.ts'],
    testTimeout: 120_000,
    watch: false,
    retry: 2,
    bail: 1,
    hookTimeout: 30_000,
    reporters: ['default', '../src/test/sentryReporter.ts'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '../src'),
    },
  },
}) as UserConfig;
