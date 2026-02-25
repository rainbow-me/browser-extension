import { describe, expect, test } from 'vitest';

import { getQueryKeyName } from './queryClient';

describe('getQueryKeyName', () => {
  test('returns empty string for empty or invalid input', () => {
    expect(getQueryKeyName([])).toBe('');
    expect(getQueryKeyName(null as unknown as readonly unknown[])).toBe('');
    expect(getQueryKeyName(undefined as unknown as readonly unknown[])).toBe(
      '',
    );
  });

  test('extracts key from createQueryKey format [args, key, config]', () => {
    expect(
      getQueryKeyName([
        { address: '0x123', currency: 'usd' },
        'consolidatedTransactions',
        { persisterVersion: 1 },
      ]),
    ).toBe('consolidatedTransactions');
    expect(getQueryKeyName([{ chainId: 1 }, 'providerGas', {}])).toBe(
      'providerGas',
    );
  });

  test('extracts key from legacy format [key, ...args]', () => {
    expect(getQueryKeyName(['ensName', '0x123', 1])).toBe('ensName');
    expect(getQueryKeyName(['TokenSearch', 1, 'eth'])).toBe('TokenSearch');
  });

  test('extracts entity from object at index 0', () => {
    expect(getQueryKeyName([{ entity: 'ensName', address: '0x123' }])).toBe(
      'ensName',
    );
    expect(getQueryKeyName([{ entity: 'assetMetadata', chainId: 1 }])).toBe(
      'assetMetadata',
    );
  });

  test('extracts type from object at index 0 when entity is missing', () => {
    expect(getQueryKeyName([{ type: 'custom', foo: 'bar' }])).toBe('custom');
  });

  test('uses index 0 when index 1 looks like chainId:address', () => {
    expect(getQueryKeyName([{ foo: 'bar' }, '1:0x1234567890abcdef', {}])).toBe(
      'unknown',
    );
  });

  test('uses index 0 when index 1 looks like raw address', () => {
    expect(
      getQueryKeyName([
        { foo: 'bar' },
        '0x1234567890abcdef1234567890abcdef12345678',
        {},
      ]),
    ).toBe('unknown');
  });

  test('returns unknown for unidentifiable keys', () => {
    expect(getQueryKeyName([null])).toBe('unknown');
    expect(getQueryKeyName([123])).toBe('unknown');
    expect(getQueryKeyName([{}])).toBe('unknown');
    expect(getQueryKeyName([{ foo: 'bar' }])).toBe('unknown');
  });

  test('does not treat "unknown" string at index 1 as key', () => {
    expect(getQueryKeyName([{}, 'unknown', {}])).toBe('unknown');
  });
});
