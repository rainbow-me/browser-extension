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
    reporters: ['default', './src/test/sentryReporter.ts'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
      static: resolve(__dirname, './static'),
    },
  },
});
