import { resolve } from 'path';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.(ts|tsx)'],
    testTimeout: 30_000,
    setupFiles: './src/test/setup.ts',
    watch: false,
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
});
