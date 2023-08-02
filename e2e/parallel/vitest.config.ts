import { UserConfig, mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from '../vitest.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      threads: true,
      maxThreads: 4,
      minThreads: 4,
    },
  }) as UserConfig,
);
