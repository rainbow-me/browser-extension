import 'dotenv/config';
import { resolve } from 'path';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.(ts|tsx)'],
    testTimeout: 45_000,
    globalSetup: './e2e/vitest.anvil.ts',
    setupFiles: './src/test/vitest.setup.ts',
    watch: false,
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
      static: resolve(__dirname, './static'),
    },
  },
});
