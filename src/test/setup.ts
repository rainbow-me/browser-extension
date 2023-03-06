/* eslint-disable @typescript-eslint/no-var-requires */
import { Crypto } from '@peculiar/webcrypto';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

vi.stubGlobal('chrome', {
  storage: {
    local: {
      get: vi.fn(() => ({})),
      set: vi.fn(),
      remove: vi.fn(),
    },
    session: {
      get: vi.fn(() => ({})),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
  runtime: {
    getURL: (url: string) => `https://local.io/${url}`,
  },
});

vi.stubGlobal('window.location', {
  pathname: 'popup.html',
});

global.crypto = new Crypto();

Object.defineProperty(window, 'crypto', {
  value: global.crypto,
  writable: true,
});

Object.defineProperty(global, 'crypto', {
  value: global.crypto,
  writable: true,
});

export const restHandlers = [
  rest.all('https://aha.rainbow.me/', (req, res, ctx) => {
    const address = req.url.searchParams.get('address') || '';
    const shouldReturnTrue =
      address.toLowerCase() === '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
    {
      return res(
        ctx.status(200),
        ctx.json({
          data: {
            addresses: { [address.toLowerCase()]: shouldReturnTrue },
          },
        }),
      );
    }
  }),
];

const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());
