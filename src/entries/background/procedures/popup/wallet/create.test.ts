import { call } from '@orpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setVaultPassword } from '~/core/keychain';
import { SessionStorage } from '~/core/storage';

import { createHandler } from './create';

describe('create through orpc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new wallet', async () => {
    // createHandler expects an object with context, but for this test, we can pass an empty object
    const result = await call(
      createHandler,
      {},
      { context: { sender: undefined } },
    );

    expect(result).toHaveProperty('address');
    expect(result.address).toBeDefined();
    expect(typeof result.address).toBe('string');
    expect(result.address.length).toBe(42);
    expect(result.address.startsWith('0x')).toBe(true);
    expect(await SessionStorage.get('userStatus')).toBe('NEEDS_PASSWORD');
  });

  it('should create a new wallet while password exists', async () => {
    await setVaultPassword('test', 'test');
    // createHandler expects an object with context, but for this test, we can pass an empty object
    const result = await call(
      createHandler,
      {},
      { context: { sender: undefined } },
    );

    expect(result).toHaveProperty('address');
    expect(result.address).toBeDefined();
    expect(typeof result.address).toBe('string');
    expect(result.address.length).toBe(42);
    expect(result.address.startsWith('0x')).toBe(true);
    expect(await SessionStorage.get('userStatus')).toBe('READY');
  });
});
