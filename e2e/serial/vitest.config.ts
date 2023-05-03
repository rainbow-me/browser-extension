import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from '../vitest.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      threads: false,
      sequence: {
        hooks: 'list',
      },
    },
  }),
);
