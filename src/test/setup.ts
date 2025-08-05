import { fakeBrowser } from '@webext-core/fake-browser';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { handlers } from './mocks/handlers';

vi.stubGlobal('chrome', fakeBrowser);
vi.mock('webextension-polyfill', async () => {
  return await import('@webext-core/fake-browser').then(({ fakeBrowser }) => ({
    default: fakeBrowser,
  }));
});

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
