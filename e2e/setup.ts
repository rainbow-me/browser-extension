import { afterAll, beforeAll } from 'vitest';

import { startMockServer } from './mockServer.js';

let mockServer: Awaited<ReturnType<typeof startMockServer>>;

beforeAll(async () => {
  try {
    mockServer = await startMockServer();
    console.log('Mock server started successfully');
  } catch (e) {
    console.error(`Error setting up test server: ${e}`);
    throw new Error('Failed to start mock server');
  }
});

afterAll(() => {
  return new Promise<void>((resolve, reject) => {
    if (mockServer) {
      mockServer.close((err) => {
        if (err) {
          console.error('Error shutting down the mock server:', err);
          reject(err);
        } else {
          console.log('Mock server closed successfully');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
});
