import { describe, expect, it } from 'vitest';

import { RainbowError } from '~/logger';

import {
  isChainNotConfiguredError,
  isTransientEthersNetworkError,
} from './error';

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

describe('isTransientEthersNetworkError', () => {
  it('returns true for ethers NETWORK_ERROR with event noNetwork (JsonRpcProvider detectNetwork)', () => {
    const err = Object.assign(new Error('could not detect network'), {
      code: 'NETWORK_ERROR',
      event: 'noNetwork',
    });
    expect(isTransientEthersNetworkError(err)).toBe(true);
  });

  it('returns false for NETWORK_ERROR with event changed (chain mismatch)', () => {
    const err = Object.assign(new Error('underlying network changed'), {
      code: 'NETWORK_ERROR',
      event: 'changed',
    });
    expect(isTransientEthersNetworkError(err)).toBe(false);
  });

  it('returns false for NETWORK_ERROR with event invalidNetwork', () => {
    const err = Object.assign(new Error('could not detect network'), {
      code: 'NETWORK_ERROR',
      event: 'invalidNetwork',
    });
    expect(isTransientEthersNetworkError(err)).toBe(false);
  });

  it('returns false for unrelated errors', () => {
    expect(isTransientEthersNetworkError(new Error('fail'))).toBe(false);
    expect(isTransientEthersNetworkError({ code: 'SERVER_ERROR' })).toBe(false);
  });

  it('returns false when NETWORK_ERROR on nested cause has no event (not assumed transient)', () => {
    const inner = Object.assign(new Error('network'), {
      code: 'NETWORK_ERROR',
    });
    const wrapped = new Error('outer', { cause: inner });
    expect(isTransientEthersNetworkError(wrapped)).toBe(false);
  });

  it('returns true when transient NETWORK_ERROR is on nested cause', () => {
    const inner = Object.assign(new Error('could not detect network'), {
      code: 'NETWORK_ERROR',
      event: 'noNetwork',
    });
    const wrapped = new Error('outer', { cause: inner });
    expect(isTransientEthersNetworkError(wrapped)).toBe(true);
  });
});
