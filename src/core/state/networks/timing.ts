import { Address } from 'viem';

import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';

/**
 * Pending transaction polling timing.
 *
 * Timeout does not drop the tx—it stays in the pending store. Polling stops
 * to save resources, but the tx is still checked on every service worker
 * start (initial poll checks all txs). When another tx needs polling, that
 * cycle skips timed-out txs; they are re-checked on the next worker start
 * (e.g. browser restart or tab activity).
 */

/** [afterMs, intervalMs] or [afterMs, 'timeout'] */
export type PendingTxPollingTier =
  | [afterMs: number, intervalMs: number]
  | [afterMs: number, 'timeout'];

/**
 * For a tx pending X ms, use the interval from the last tier where
 * tier.afterMs <= X. 'timeout' means stop polling (tx stays in store).
 */
export type PendingTxPollingSchedule = PendingTxPollingTier[];

export interface PendingTxPollingChainConfig {
  schedule: PendingTxPollingSchedule;
}

function schedule(...tiers: PendingTxPollingTier[]): PendingTxPollingSchedule {
  return [...tiers].sort((a, b) => a[0] - b[0]);
}

/** ~12s blocks (Ethereum, Moonbeam). Timeout: 1hr. */
const SLOW_SCHEDULE = schedule(
  [0, 5000], // 0–5min:   every 5s
  [300000, 15000], // 5–20min: every 15s
  [1200000, 30000], // 20–60min: every 30s
  [3600000, 'timeout'], // 1hr+: timeout
);

/** ~3–5s blocks (Scroll, Gnosis, Celo, Linea). Timeout: 1hr. */
const MEDIUM_SCHEDULE = schedule(
  [0, 3000], // 0–2min:   every 3s
  [120000, 5000], // 2–10min: every 5s
  [600000, 15000], // 10–30min: every 15s
  [1800000, 30000], // 30–60min: every 30s
  [3600000, 'timeout'], // 1hr+: timeout
);

/** ~1–2s blocks (OP Stack, Polygon, BSC, Avalanche, Zora, zkSync). Timeout: 1hr. */
const FAST_SCHEDULE = schedule(
  [0, 2000], // 0–2min:   every 2s
  [120000, 5000], // 2–10min: every 5s
  [600000, 15000], // 10–30min: every 15s
  [1800000, 30000], // 30–60min: every 30s
  [3600000, 'timeout'], // 1hr+: timeout
);

/** ~0.25s blocks (Arbitrum). Timeout: 1hr. */
const VERY_FAST_SCHEDULE = schedule(
  [0, 1000], // 0–1min:   every 1s
  [60000, 3000], // 1–5min:   every 3s
  [300000, 10000], // 5–20min: every 10s
  [1200000, 30000], // 20–60min: every 30s
  [3600000, 'timeout'], // 1hr+: timeout
);

/** Testnets and local dev. Timeout: 15min. */
const TESTNET_SCHEDULE = schedule(
  [0, 2000], // 0–1min:   every 2s
  [60000, 5000], // 1–5min:   every 5s
  [300000, 15000], // 5–15min: every 15s
  [900000, 'timeout'], // 15min+: timeout
);

const PENDING_TX_POLLING_CONFIG: Record<number, PendingTxPollingChainConfig> = {
  // Tier 1: ~12s blocks
  [ChainId.mainnet]: { schedule: SLOW_SCHEDULE },
  [ChainId.moonbeam]: { schedule: SLOW_SCHEDULE },

  // Tier 2: ~3–5s blocks
  [ChainId.scroll]: { schedule: MEDIUM_SCHEDULE },
  [ChainId.gnosis]: { schedule: MEDIUM_SCHEDULE },
  [ChainId.celo]: { schedule: MEDIUM_SCHEDULE },
  [ChainId.linea]: { schedule: MEDIUM_SCHEDULE },
  [ChainId.manta]: { schedule: MEDIUM_SCHEDULE },
  [ChainId.immutableZkEvm]: { schedule: MEDIUM_SCHEDULE },
  [ChainId.gravity]: { schedule: MEDIUM_SCHEDULE },
  [ChainId.b3]: { schedule: MEDIUM_SCHEDULE },
  [ChainId.palm]: { schedule: MEDIUM_SCHEDULE },
  [ChainId.godwoken]: { schedule: MEDIUM_SCHEDULE },
  [ChainId.ink]: { schedule: MEDIUM_SCHEDULE },

  // Tier 3: ~1–2s blocks
  [ChainId.optimism]: { schedule: FAST_SCHEDULE },
  [ChainId.base]: { schedule: FAST_SCHEDULE },
  [ChainId.polygon]: { schedule: FAST_SCHEDULE },
  [ChainId.polygonZkEvm]: { schedule: FAST_SCHEDULE },
  [ChainId.bsc]: { schedule: FAST_SCHEDULE },
  [ChainId.avalanche]: { schedule: FAST_SCHEDULE },
  [ChainId.zora]: { schedule: FAST_SCHEDULE },
  [ChainId.mode]: { schedule: FAST_SCHEDULE },
  [ChainId.blast]: { schedule: FAST_SCHEDULE },
  [ChainId.opbnb]: { schedule: FAST_SCHEDULE },
  [ChainId.zksync]: { schedule: FAST_SCHEDULE },
  [ChainId.fantom]: { schedule: FAST_SCHEDULE },
  [ChainId.canto]: { schedule: FAST_SCHEDULE },
  [ChainId.degen]: { schedule: FAST_SCHEDULE },
  [ChainId.xai]: { schedule: FAST_SCHEDULE },
  [ChainId.berachain]: { schedule: FAST_SCHEDULE },
  [ChainId.forma]: { schedule: FAST_SCHEDULE },
  [ChainId.apechain]: { schedule: FAST_SCHEDULE },
  [ChainId.apechainCurtis]: { schedule: FAST_SCHEDULE },
  [ChainId.sei]: { schedule: FAST_SCHEDULE },
  [ChainId.sanko]: { schedule: FAST_SCHEDULE },
  [ChainId.loot]: { schedule: FAST_SCHEDULE },
  [ChainId.rari]: { schedule: FAST_SCHEDULE },
  [ChainId.proofOfPlayApex]: { schedule: FAST_SCHEDULE },
  [ChainId.proofOfPlayBoss]: { schedule: FAST_SCHEDULE },

  // Tier 4: ~0.25s blocks (Arbitrum)
  [ChainId.arbitrum]: { schedule: VERY_FAST_SCHEDULE },
  [ChainId.arbitrumNova]: { schedule: VERY_FAST_SCHEDULE },

  // Tier 5: Testnets and local dev
  [ChainId.holesky]: { schedule: TESTNET_SCHEDULE },
  [ChainId.sepolia]: { schedule: TESTNET_SCHEDULE },
  [ChainId.optimismSepolia]: { schedule: TESTNET_SCHEDULE },
  [ChainId.baseSepolia]: { schedule: TESTNET_SCHEDULE },
  [ChainId.polygonAmoy]: { schedule: TESTNET_SCHEDULE },
  [ChainId.bscTestnet]: { schedule: TESTNET_SCHEDULE },
  [ChainId.avalancheFuji]: { schedule: TESTNET_SCHEDULE },
  [ChainId.zoraSepolia]: { schedule: TESTNET_SCHEDULE },
  [ChainId.arbitrumSepolia]: { schedule: TESTNET_SCHEDULE },
  [ChainId.blastSepolia]: { schedule: TESTNET_SCHEDULE },
  [ChainId.berachainbArtio]: { schedule: TESTNET_SCHEDULE },
  [ChainId.gravitySepolia]: { schedule: TESTNET_SCHEDULE },
  [ChainId.inkSepolia]: { schedule: TESTNET_SCHEDULE },
  [ChainId.sankoTestnet]: { schedule: TESTNET_SCHEDULE },
  [ChainId.hardhat]: { schedule: TESTNET_SCHEDULE },
  [ChainId.hardhatOptimism]: { schedule: TESTNET_SCHEDULE },
};

/** Custom chains and new networks. Timeout: 1hr. */
const DEFAULT_PENDING_TX_POLLING_CONFIG: PendingTxPollingChainConfig = {
  schedule: schedule(
    [0, 3000], // 0–2min:   every 3s
    [120000, 5000], // 2–10min: every 5s
    [600000, 15000], // 10–30min: every 15s
    [1800000, 30000], // 30–60min: every 30s
    [3600000, 'timeout'], // 1hr+: stop
  ),
};

/** Returns null when timed out (tx stays in store, checked on worker start). */
export function getPendingTransactionPollingInterval(
  chainId: ChainId,
  pendingDurationMs: number,
): number | null {
  const config =
    PENDING_TX_POLLING_CONFIG[chainId] ?? DEFAULT_PENDING_TX_POLLING_CONFIG;

  let interval: number | 'timeout' = config.schedule[0][1];
  for (const tier of config.schedule) {
    const [afterMs, value] = tier;
    if (pendingDurationMs >= afterMs) {
      interval = value;
    }
  }
  return interval === 'timeout' ? null : interval;
}

export function isPendingTxTimedOut(
  chainId: ChainId,
  pendingDurationMs: number,
): boolean {
  return (
    getPendingTransactionPollingInterval(chainId, pendingDurationMs) === null
  );
}

/** Used when no pending txs or all timed out—keeps polling to catch new ones. */
export const PENDING_TX_POLLING_FALLBACK_MS = 5000;

/** Timed-out txs are excluded (they don't drive the schedule). */
export function getMinPollingIntervalForPendingTxs(
  pendingTransactions: Record<Address, RainbowTransaction[]>,
  fallbackMs = PENDING_TX_POLLING_FALLBACK_MS,
): number {
  const now = Date.now();
  const intervals: number[] = [];

  for (const txs of Object.values(pendingTransactions)) {
    for (const tx of txs) {
      if (tx.status === 'pending' && tx.chainId) {
        const pendingDurationMs = tx.lastSubmittedTimestamp
          ? now - tx.lastSubmittedTimestamp
          : 0;
        const interval = getPendingTransactionPollingInterval(
          tx.chainId,
          pendingDurationMs,
        );
        if (interval !== null) {
          intervals.push(interval);
        }
      }
    }
  }

  if (intervals.length === 0) {
    return fallbackMs;
  }

  return Math.min(...intervals);
}
