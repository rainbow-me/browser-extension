import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { MockChromeStorage, setupMockChrome } from '~/test/mock/chromeStorage';

import { handlers } from './mocks/handlers';

// Set up a complete Chrome mock with storage.onChanged support
const mockChromeStorage = new MockChromeStorage();
setupMockChrome(mockChromeStorage);

// Also stub it with vi.stubGlobal to ensure vitest properly tracks it
// Store the instance after setup so it can be restored by tests that need isolation
vi.stubGlobal('chrome', globalThis.chrome);

vi.stubGlobal('window.location', {
  pathname: 'popup.html',
});

const abortFn = vi.fn();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.AbortController = vi.fn(() => ({
  abort: abortFn,
}));

Object.defineProperty(window, 'crypto', {
  value: global.crypto,
  writable: true,
});

Object.defineProperty(global, 'crypto', {
  value: global.crypto,
  writable: true,
});

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  location.replace(`https://aha.rainbow.me/`);
  server.listen({ onUnhandledRequest: 'bypass' });
});

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());
