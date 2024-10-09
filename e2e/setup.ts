import { afterAll, beforeAll } from 'vitest';

import { startMockServer } from './mockServer.js';

let mockServer: Awaited<ReturnType<typeof startMockServer>>;

beforeAll(async () => {
  mockServer = await startMockServer();
});

afterAll(() => {
  return new Promise<void>((resolve) => {
    mockServer.close(() => {
      resolve();
    });
  });
});
