import { UserConfig, mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from '../vitest.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      threads: false,
      bail: 1,
      sequence: {
        shuffle: false,
        sequencer: class Sequencer {
          sort(files) {
            return files;
          }
          shard(files) {
            return files;
          }
        },
      },
      reporters: ['default', '../src/test/sentryReporter.ts'],
    },
  }) as UserConfig,
);
