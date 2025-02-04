import { resolve } from 'path';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: '.env' });

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
      static: resolve(__dirname, './static'),
    },
  },
});
