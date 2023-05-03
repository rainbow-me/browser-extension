import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import { BaseSequencer } from 'vitest/node';

import viteConfig from '../vitest.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      threads: false,
      sequence: {
        shuffle: false,
        sequencer: class Sequencer extends BaseSequencer {
          async sort(files) {
            return files;
          }
        },
      },
    },
  }),
);
