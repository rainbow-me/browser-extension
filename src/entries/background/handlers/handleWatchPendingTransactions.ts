import type { Address } from 'viem';

import { usePendingTransactionsStore } from '~/core/state';
import { useBatchStore } from '~/core/state/batches';
import { getMinPollingIntervalForPendingTxs } from '~/core/state/networks/timing';
import { watchPendingTransactions } from '~/core/state/transactions/pendingTransactions/watchPendingTransactions';
import type { RainbowTransaction } from '~/core/types/transactions';
import { RainbowError, logger } from '~/logger';

import { POPUP_PORT_NAME } from '../procedures/popup/constants';
import { getActivePopupPortCount } from '../procedures/popup/popupPortManager';

let nextPollTimeout: ReturnType<typeof setTimeout> | null = null;
let nextPollAt = 0;
let initialAllPendingPollDone = false;
let initialBatchOnlyPollDone = false;
let unsubscribe: (() => void) | null = null;

function isPopupOpen() {
  return getActivePopupPortCount() > 0;
}

function isBatchTx(tx: RainbowTransaction, address: Address): boolean {
  if (tx.nonce == null) return false;
  const { batches } = useBatchStore.getState();
  return Object.values(batches).some(
    (batch) =>
      batch.chainId === tx.chainId &&
      batch.sender.toLowerCase() === address.toLowerCase() &&
      batch.nonces.includes(tx.nonce),
  );
}

/**
 * Returns pending txs that should be polled right now.
 * - Popup open: all pending txs
 * - Popup closed: only EIP-5792 batch txs
 */
function getPendingTxPollScope(): {
  pollablePendingTxs: Record<Address, RainbowTransaction[]>;
  isPollingAllPendingTxs: boolean;
} {
  const { pendingTransactions } = usePendingTransactionsStore.getState();
  const isPollingAllPendingTxs = isPopupOpen();

  if (isPollingAllPendingTxs) {
    return { pollablePendingTxs: pendingTransactions, isPollingAllPendingTxs };
  }

  const result: Record<string, RainbowTransaction[]> = {};

  for (const [addr, txs] of Object.entries(pendingTransactions)) {
    const filtered = txs.filter((tx) => isBatchTx(tx, addr as Address));
    if (filtered.length > 0) {
      result[addr] = filtered;
    }
  }

  return { pollablePendingTxs: result, isPollingAllPendingTxs };
}

function scheduleNextPoll(): void {
  if (nextPollTimeout) {
    clearTimeout(nextPollTimeout);
  }

  const { pollablePendingTxs } = getPendingTxPollScope();
  const intervalMs = getMinPollingIntervalForPendingTxs(pollablePendingTxs);

  nextPollAt = Date.now() + intervalMs;

  nextPollTimeout = setTimeout(() => {
    nextPollTimeout = null;
    runPollCycle();
  }, intervalMs);
}

/**
 * Called when pendingTransactions changes mid-cycle (e.g. new tx submitted).
 * If the new minimum interval is shorter than the time remaining on the
 * current timer, reschedule immediately with the shorter interval.
 */
function maybeReschedule(): void {
  if (!nextPollTimeout) return;

  const { pollablePendingTxs } = getPendingTxPollScope();
  const newIntervalMs = getMinPollingIntervalForPendingTxs(pollablePendingTxs);
  const remaining = Math.max(0, nextPollAt - Date.now());

  if (newIntervalMs < remaining) {
    clearTimeout(nextPollTimeout);
    nextPollAt = Date.now() + newIntervalMs;
    nextPollTimeout = setTimeout(() => {
      nextPollTimeout = null;
      runPollCycle();
    }, newIntervalMs);
  }
}

async function runPollCycle(): Promise<void> {
  const { pollablePendingTxs, isPollingAllPendingTxs } =
    getPendingTxPollScope();
  const skipTimedOutTxs = isPollingAllPendingTxs
    ? initialAllPendingPollDone
    : initialBatchOnlyPollDone;
  if (isPollingAllPendingTxs) {
    initialAllPendingPollDone = true;
    initialBatchOnlyPollDone = true;
  } else {
    initialBatchOnlyPollDone = true;
  }

  try {
    await watchPendingTransactions(pollablePendingTxs, { skipTimedOutTxs });
  } catch (e) {
    logger.error(
      new RainbowError('watchPendingTransactions failed', { cause: e }),
    );
  }
  scheduleNextPoll();
}

export async function handleWatchPendingTransactions(): Promise<void> {
  if (nextPollTimeout !== null) return;

  if (!unsubscribe) {
    unsubscribe = usePendingTransactionsStore.subscribe(
      (s) => s.pendingTransactions,
      maybeReschedule,
    );

    // Adjust polling scope when popup opens or closes:
    // - open: poll all pending txs for responsive UI
    // - closed: poll only batch txs
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === POPUP_PORT_NAME) {
        maybeReschedule();
        port.onDisconnect.addListener(() => maybeReschedule());
      }
    });
  }

  await usePendingTransactionsStore.persist.hydrationPromise();
  runPollCycle();
}
