import { UserConfig } from 'vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  workers: 4,
  test: {
    include: ['./**/**/*.test.ts'],
    testTimeout: 60_000,
    watch: false,
    retry: 2,
    bail: 1,
  },
}) as UserConfig;
