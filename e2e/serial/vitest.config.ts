import { UserConfig, mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from '../vitest.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      bail: 1,
      threads: false,
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
    },
  }) as UserConfig,
);
