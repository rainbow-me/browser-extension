import { usePendingTransactionsStore } from '~/core/state';
import { getMinPollingIntervalForPendingTxs } from '~/core/state/networks/timing';
import { watchPendingTransactions } from '~/core/state/transactions/pendingTransactions/watchPendingTransactions';
import { RainbowError, logger } from '~/logger';

let nextPollTimeout: ReturnType<typeof setTimeout> | null = null;
let nextPollAt = 0;
let initialPollDone = false;
let unsubscribe: (() => void) | null = null;

function scheduleNextPoll(): void {
  if (nextPollTimeout) {
    clearTimeout(nextPollTimeout);
  }

  const { pendingTransactions } = usePendingTransactionsStore.getState();
  const intervalMs = getMinPollingIntervalForPendingTxs(pendingTransactions);

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

  const { pendingTransactions } = usePendingTransactionsStore.getState();
  const newIntervalMs = getMinPollingIntervalForPendingTxs(pendingTransactions);
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
  const skipTimedOutTxs = initialPollDone;
  initialPollDone = true;

  try {
    await watchPendingTransactions({ skipTimedOutTxs });
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
  }

  await usePendingTransactionsStore.persist.hydrationPromise();
  runPollCycle();
}
