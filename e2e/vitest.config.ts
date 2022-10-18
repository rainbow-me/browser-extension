import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import baseConfig from '../vitest.config';

const e2eConfig = defineConfig({
  test: {
    testTimeout: 20_000,
  },
});

export default mergeConfig(baseConfig, e2eConfig);
