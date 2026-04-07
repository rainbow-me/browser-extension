import { describe, expect, it } from 'vitest';

import { RainbowError } from '~/logger';

import { isChainNotConfiguredError } from './error';

describe('isChainNotConfiguredError', () => {
  it('returns true for direct Chain id not found message', () => {
    expect(isChainNotConfiguredError(new Error('Chain 167009 not found'))).toBe(
      true,
    );
  });

  it('returns false for unrelated messages', () => {
    expect(isChainNotConfiguredError(new Error('network error'))).toBe(false);
    expect(isChainNotConfiguredError(new Error('Chain foo not found'))).toBe(
      false,
    );
  });

  it('returns true when wrapped in RainbowError Failed to create provider', () => {
    const inner = new Error('Chain 34443 not found');
    const wrapped = new RainbowError('Failed to create provider', {
      cause: inner,
    });
    expect(isChainNotConfiguredError(wrapped)).toBe(true);
  });

  it('returns true for nested cause chains', () => {
    const root = new Error('outer', {
      cause: new Error('middle', {
        cause: new Error('Chain 204 not found'),
      }),
    });
    expect(isChainNotConfiguredError(root)).toBe(true);
  });
});
