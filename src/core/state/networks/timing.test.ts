import { Address } from 'viem';
import { describe, expect, test, vi } from 'vitest';

import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';

import {
  PENDING_TX_POLLING_FALLBACK_MS,
  getMinPollingIntervalForPendingTxs,
  getPendingTransactionPollingInterval,
  isPendingTxTimedOut,
} from './timing';

vi.mock('~/core/utils/chains', () => ({
  getChain: ({ chainId }: { chainId: ChainId }) => {
    const testnets = new Set<ChainId>([
      ChainId.sepolia,
      ChainId.holesky,
      ChainId.hardhat,
      ChainId.hardhatOptimism,
    ]);
    return { testnet: testnets.has(chainId) };
  },
}));

const addr = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' as Address;

function makePendingTx(
  chainId: ChainId,
  lastSubmittedTimestamp?: number,
): RainbowTransaction {
  return {
    status: 'pending',
    chainId,
    hash: '0xabc',
    nonce: 0,
    from: addr,
    lastSubmittedTimestamp,
  } as unknown as RainbowTransaction;
}

describe('getPendingTransactionPollingInterval', () => {
  test('mainnet (slow) — initial tier', () => {
    expect(getPendingTransactionPollingInterval(ChainId.mainnet, 0)).toBe(5000);
  });

  test('mainnet (slow) — 6 min in moves to 15s tier', () => {
    expect(getPendingTransactionPollingInterval(ChainId.mainnet, 360_000)).toBe(
      15_000,
    );
  });

  test('mainnet (slow) — 25 min in moves to 30s tier', () => {
    expect(
      getPendingTransactionPollingInterval(ChainId.mainnet, 1_500_000),
    ).toBe(30_000);
  });

  test('mainnet (slow) — 1hr+ times out', () => {
    expect(
      getPendingTransactionPollingInterval(ChainId.mainnet, 3_600_000),
    ).toBeNull();
  });

  test('arbitrum (fast) — initial tier is 2s', () => {
    expect(getPendingTransactionPollingInterval(ChainId.arbitrum, 0)).toBe(
      2000,
    );
  });

  test('arbitrum (fast) — 3 min in moves to 5s tier', () => {
    expect(
      getPendingTransactionPollingInterval(ChainId.arbitrum, 180_000),
    ).toBe(5000);
  });

  test('scroll (medium) — initial tier is 3s', () => {
    expect(getPendingTransactionPollingInterval(ChainId.scroll, 0)).toBe(3000);
  });

  test('testnet detected via getChain — uses testnet schedule', () => {
    expect(getPendingTransactionPollingInterval(ChainId.sepolia, 0)).toBe(2000);
  });

  test('testnet — 15min+ times out (shorter than mainnet)', () => {
    expect(
      getPendingTransactionPollingInterval(ChainId.sepolia, 900_000),
    ).toBeNull();
    // mainnet would still be polling at 15s here (5–20min tier)
    expect(getPendingTransactionPollingInterval(ChainId.mainnet, 900_000)).toBe(
      15_000,
    );
  });

  test('unknown chain falls back to default schedule (3s initial)', () => {
    expect(getPendingTransactionPollingInterval(999_999 as ChainId, 0)).toBe(
      3000,
    );
  });
});

describe('isPendingTxTimedOut', () => {
  test('not timed out when within schedule', () => {
    expect(isPendingTxTimedOut(ChainId.mainnet, 0)).toBe(false);
    expect(isPendingTxTimedOut(ChainId.mainnet, 1_800_000)).toBe(false);
  });

  test('timed out at threshold', () => {
    expect(isPendingTxTimedOut(ChainId.mainnet, 3_600_000)).toBe(true);
  });

  test('testnet times out earlier', () => {
    expect(isPendingTxTimedOut(ChainId.hardhat, 900_000)).toBe(true);
    expect(isPendingTxTimedOut(ChainId.mainnet, 900_000)).toBe(false);
  });
});

describe('getMinPollingIntervalForPendingTxs', () => {
  test('returns fallback when no pending txs', () => {
    expect(getMinPollingIntervalForPendingTxs({})).toBe(
      PENDING_TX_POLLING_FALLBACK_MS,
    );
  });

  test('returns fallback when all txs are mined', () => {
    const txs = {
      [addr]: [
        { ...makePendingTx(ChainId.mainnet), status: 'confirmed' as const },
      ],
    } as Record<Address, RainbowTransaction[]>;
    expect(getMinPollingIntervalForPendingTxs(txs)).toBe(
      PENDING_TX_POLLING_FALLBACK_MS,
    );
  });

  test('picks the shortest interval across chains', () => {
    const now = Date.now();
    const txs = {
      [addr]: [
        makePendingTx(ChainId.mainnet, now), // 5000ms (slow initial)
        makePendingTx(ChainId.arbitrum, now), // 2000ms (fast initial)
      ],
    } as Record<Address, RainbowTransaction[]>;
    expect(getMinPollingIntervalForPendingTxs(txs)).toBe(2000);
  });

  test('ignores timed-out txs', () => {
    const longAgo = Date.now() - 4_000_000; // >1hr ago
    const now = Date.now();
    const txs = {
      [addr]: [
        makePendingTx(ChainId.mainnet, longAgo), // timed out
        makePendingTx(ChainId.arbitrum, now), // 2000ms
      ],
    } as Record<Address, RainbowTransaction[]>;
    expect(getMinPollingIntervalForPendingTxs(txs)).toBe(2000);
  });

  test('returns fallback when all txs are timed out', () => {
    const longAgo = Date.now() - 4_000_000;
    const txs = {
      [addr]: [makePendingTx(ChainId.mainnet, longAgo)],
    } as Record<Address, RainbowTransaction[]>;
    expect(getMinPollingIntervalForPendingTxs(txs)).toBe(
      PENDING_TX_POLLING_FALLBACK_MS,
    );
  });

  test('tx with no lastSubmittedTimestamp uses 0 duration', () => {
    const txs = {
      [addr]: [makePendingTx(ChainId.mainnet)],
    } as Record<Address, RainbowTransaction[]>;
    // 0 duration → initial tier (5000ms for mainnet)
    expect(getMinPollingIntervalForPendingTxs(txs)).toBe(5000);
  });
});
