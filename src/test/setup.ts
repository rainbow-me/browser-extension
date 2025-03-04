import { HttpResponse, http } from 'msw';
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
  runtime: {},
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

type ApiResponse = {
  data: {
    addresses: Record<string, boolean>;
  };
};

type ApiResponses = Record<string, ApiResponse>;

const apiResponses: ApiResponses = {
  '0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a': {
    data: {
      addresses: {
        '0x01': true,
        '0x02': true,
        '0x03': true,
        '0x04': true,
        '0x05': true,
        '0x06': true,
        '0x07': true,
        '0x08': true,
        '0x09': true,
        '0x0a': true,
      },
    },
  },
  '0x0b,0x0c,0x0d,0x0e,0x0f,0x10,0x11,0x12,0x13,0x14': {
    data: {
      addresses: {
        '0x0b': true,
        '0x0c': true,
        '0x0d': true,
        '0x0e': true,
        '0x0f': true,
        '0x10': true,
        '0x11': true,
        '0x12': true,
        '0x13': true,
        '0x14': true,
      },
    },
  },
  '0x15,0x16,0x17,0x18,0x19,0x1a,0x1b,0x1c,0x1d,0x1e': {
    data: {
      addresses: {
        '0x15': true,
        '0x16': true,
        '0x17': false,
        '0x18': false,
        '0x19': false,
        '0x1a': false,
        '0x1b': false,
        '0x1c': false,
        '0x1d': false,
        '0x1e': false,
      },
    },
  },

  '0x3E1d483a494Db7507102B43eefD4078C006ba2fa,0x0E169Db4A7A8Ec4f4B2A5DB36bEd24B6E3b33eF9,0x40AAF32c442b3E5b136823e1b153e425eb77c7ad,0x2f66868F8a35436f02FCd564B9Eea36B5bF91974,0x5fa350Fb902AB96D27FBBCB01606774D4376d959,0x456eb0100c30e74EBbE59274947b93c34AB6D23c,0xa2023B6f545327ae2A1a3E40e80c8E223956ea76,0x84A2D20F523a63Cf5D2C53E839149e2eDB4D8214,0x32f030335bac1443972d1932DAD3c6F3c3299590,0x20dEB9a8f6E2C6ECD31f7c634BFEAb83aB727dE1':
    {
      data: {
        addresses: {
          '0x3E1d483a494Db7507102B43eefD4078C006ba2fa': true,
          '0x0E169Db4A7A8Ec4f4B2A5DB36bEd24B6E3b33eF9': true,
          '0x40AAF32c442b3E5b136823e1b153e425eb77c7ad': false,
          '0x2f66868F8a35436f02FCd564B9Eea36B5bF91974': false,
          '0x5fa350Fb902AB96D27FBBCB01606774D4376d959': false,
          '0x456eb0100c30e74EBbE59274947b93c34AB6D23c': false,
          '0xa2023B6f545327ae2A1a3E40e80c8E223956ea76': false,
          '0x84A2D20F523a63Cf5D2C53E839149e2eDB4D8214': false,
          '0x32f030335bac1443972d1932DAD3c6F3c3299590': false,
          '0x20dEB9a8f6E2C6ECD31f7c634BFEAb83aB727dE1': false,
        },
      },
    },
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,0x70997970C51812dc3A010C7d01b50e0d17dc79C8,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,0x90F79bf6EB2c4f870365E785982E1f101E93b906,0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65,0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc,0x976EA74026E726554dB657fA54763abd0C3a0aa9,0x14dC79964da2C08b23698B3D3cc7Ca32193d9955,0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f,0xa0Ee7A142d267C1f36714E4a8F75612F20a79720':
    {
      data: {
        addresses: {
          '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266': true,
          '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': true,
          '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': true,
          '0x90f79bf6eb2c4f870365e785982e1f101e93b906': true,
          '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65': true,
          '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc': true,
          '0x976ea74026e726554db657fa54763abd0c3a0aa9': true,
          '0x14dc79964da2c08b23698b3d3cc7ca32193d9955': true,
          '0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f': false,
          '0xa0ee7a142d267c1f36714e4a8f75612f20a79720': false,
        },
      },
    },
  '0x101,0x102,0x103,0x104,0x105,0x106,0x107,0x108,0x109,0x10a': {
    data: {
      addresses: {
        '0x101': false,
        '0x102': false,
        '0x103': false,
        '0x104': false,
        '0x105': false,
        '0x106': false,
        '0x107': false,
        '0x108': false,
        '0x109': false,
        '0x10a': false,
      },
    },
  },
};
const restHandlers = [
  http.all('https://aha.rainbow.me/', ({ request }) => {
    const url = new URL(request.url);
    const address = url.searchParams.get('address') || '';
    return HttpResponse.json(apiResponses?.[address], { status: 200 });
  }),
  http.options('*', () => {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }),
];

const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => {
  location.replace(`https://aha.rainbow.me/`);
  server.listen({ onUnhandledRequest: 'bypass' });
});

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());
