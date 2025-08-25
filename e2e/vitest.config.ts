import 'dotenv/config';

import path from 'node:path';

import { defineConfig } from 'vitest/config';
import type { TestSequencer, TestSpecification } from 'vitest/node';

export default defineConfig({
  test: {
    include: ['./**/**/*.test.ts'],
    globalSetup: path.resolve(__dirname, './vitest.anvil.ts'),
    watch: false,
    testTimeout: 120_000,
    hookTimeout: 30_000,
    bail: 1,
    pool: 'forks',
    maxWorkers: 1,
    isolate: false,
    reporters: ['verbose'],
    sequence: {
      sequencer: class implements TestSequencer {
        sort(files: TestSpecification[]) {
          return files;
        }
        shard(files: TestSpecification[]) {
          return files;
        }
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '../src'),
      static: path.resolve(__dirname, '../static'),
    },
  },
});
