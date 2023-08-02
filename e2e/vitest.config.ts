import { UserConfig } from 'vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    maxThreads: 4,
    minThreads: 4,
    include: ['./**/**/*.test.ts'],
    testTimeout: 60_000,
    watch: false,
    retry: 2,
    bail: 1,
  },
}) as UserConfig;
