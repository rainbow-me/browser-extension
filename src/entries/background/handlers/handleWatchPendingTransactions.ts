import { watchPendingTransactions } from '~/core/state/transactions/pendingTransactions/watchPendingTransactions';
import { RainbowError, logger } from '~/logger';

const POLLING_INTERVAL_MS = 5000;

let pollInterval: ReturnType<typeof setInterval> | null = null;

async function runPollCycle(): Promise<void> {
  try {
    await watchPendingTransactions();
  } catch (e) {
    logger.error(
      new RainbowError('watchPendingTransactions failed', { cause: e }),
    );
  }
}

export function handleWatchPendingTransactions(): void {
  if (pollInterval !== null) return;

  runPollCycle();
  pollInterval = setInterval(runPollCycle, POLLING_INTERVAL_MS);
}
