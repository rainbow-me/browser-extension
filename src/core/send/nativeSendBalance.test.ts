import { expect, test } from 'vitest';

import { hasEnoughNativeBalanceForSend } from './nativeSendBalance';

test('hasEnoughNativeBalanceForSend is false when balance < value + gas', () => {
  expect(
    hasEnoughNativeBalanceForSend({
      balanceWei: 99n,
      valueWei: 50n,
      gasFeeWei: 50n,
    }),
  ).toBe(false);
});

test('hasEnoughNativeBalanceForSend is true when balance equals value + gas', () => {
  expect(
    hasEnoughNativeBalanceForSend({
      balanceWei: 100n,
      valueWei: 50n,
      gasFeeWei: 50n,
    }),
  ).toBe(true);
});

test('hasEnoughNativeBalanceForSend is true for gas-only when balance covers gas', () => {
  expect(
    hasEnoughNativeBalanceForSend({
      balanceWei: 21_000_000_000_000n,
      valueWei: 0n,
      gasFeeWei: 21_000_000_000_000n,
    }),
  ).toBe(true);
});
