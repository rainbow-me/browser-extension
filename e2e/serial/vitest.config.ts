import path from 'path';

import { UserConfig, mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from '../vitest.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      isolate: false,
      fileParallelism: false,
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
      setupFiles: [path.resolve(__dirname, '../setup.ts')],
    },
  }) as UserConfig,
);
