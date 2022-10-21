import { vi } from 'vitest';

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
});

vi.stubGlobal('crypto', {
  getRandomValues: vi.fn(() => new Uint8Array(32)),
  subtle: {
    importKey: () => Promise.resolve('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
    encrypt: () =>
      Promise.resolve(
        '{"data":"cH46ZE6esBXoZwZNjng6pjdT/M88+OI0jUVwao7ARXt3kp8J5c24942Z/OJKBNepZPczA7thG/6osxiUzrr4FwBBsmO+6iJW1VJZxp98vRYhrztmJjT2abQ08xYEN3QG+iPlaKJzVLUkxG6OpJzl/VTJx5QxA6axMrzryMXEFQq/QIvwUwv6eZZKOaBy5UGXgCymxUIKJnbISDci+X4BzL8kovYKT9aMrX5K2eHfHvqIzEPnKmIWscFDqf6M6ZVq34Wz8CE=","iv":"j0GH3IJkoi1++zpRU0EiXw==","salt":"alOzvuO6fA6UnO3JEjwASz/xlQ8lcqxzg78bD5OgtXo="}',
      ),
    decrypt: () => Promise.resolve(''),
    deriveKey: () => Promise.resolve('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
  },
});

vi.mock('@metamask/browser-passworder', () => {
  const Encryptor = {
    encrypt: () =>
      Promise.resolve(
        '{"data":"cH46ZE6esBXoZwZNjng6pjdT/M88+OI0jUVwao7ARXt3kp8J5c24942Z/OJKBNepZPczA7thG/6osxiUzrr4FwBBsmO+6iJW1VJZxp98vRYhrztmJjT2abQ08xYEN3QG+iPlaKJzVLUkxG6OpJzl/VTJx5QxA6axMrzryMXEFQq/QIvwUwv6eZZKOaBy5UGXgCymxUIKJnbISDci+X4BzL8kovYKT9aMrX5K2eHfHvqIzEPnKmIWscFDqf6M6ZVq34Wz8CE=","iv":"j0GH3IJkoi1++zpRU0EiXw==","salt":"alOzvuO6fA6UnO3JEjwASz/xlQ8lcqxzg78bD5OgtXo="}',
      ),
    decrypt: () =>
      Promise.resolve([
        {
          imported: true,
          type: 'HdKeychain',
          _accountsEnabled: 1,
          _hdPath: "m/44'/60'/0'/0",
          _mnemonic:
            'convince artist seek flower orange slogan flower predict glove oxygen flock tenant',
          _wallets: [{ privateKey: '0x1', address: '0x2' }],
        },
      ]),
  };

  return { default: Encryptor };
});
