import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.(ts|tsx)'],
    testTimeout: 5_000,
    setupFiles: './src/test/setup.ts',
    watch: false,
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
});
