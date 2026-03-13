import { usePendingTransactionsStore } from '~/core/state';
import { getMinPollingIntervalForPendingTxs } from '~/core/state/networks/timing';
import { watchPendingTransactions } from '~/core/state/transactions/pendingTransactions/watchPendingTransactions';
import { RainbowError, logger } from '~/logger';

let nextPollTimeout: ReturnType<typeof setTimeout> | null = null;
let initialPollDone = false;

function scheduleNextPoll(): void {
  if (nextPollTimeout) {
    clearTimeout(nextPollTimeout);
  }

  const { pendingTransactions } = usePendingTransactionsStore.getState();
  const intervalMs = getMinPollingIntervalForPendingTxs(pendingTransactions);

  nextPollTimeout = setTimeout(() => {
    nextPollTimeout = null;
    runPollCycle();
  }, intervalMs);
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

export function handleWatchPendingTransactions(): void {
  if (nextPollTimeout !== null) return;

  // First run is immediate - checks all txs including timed-out (once on worker start)
  runPollCycle();
}
