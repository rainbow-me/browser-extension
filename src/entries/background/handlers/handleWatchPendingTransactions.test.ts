import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const address = '0x1234567890abcdef1234567890abcdef12345678';
  const regularTx = {
    chainId: 1,
    hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    nonce: 1,
    status: 'pending',
  };
  const batchTx = {
    chainId: 1,
    hash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    nonce: 2,
    status: 'pending',
  };
  const pendingTransactions = { [address]: [regularTx, batchTx] };

  return {
    activePopupPortCount: 0,
    address,
    batchTx,
    getMinPollingIntervalForPendingTxs: vi.fn(),
    onConnectAddListener: vi.fn(),
    pendingTransactions,
    regularTx,
    useBatchStore: {
      getState: vi.fn(() => ({
        batches: {
          batch: {
            chainId: 1,
            nonces: [batchTx.nonce],
            sender: address,
          },
        },
      })),
    },
    usePendingTransactionsStore: {
      getState: vi.fn(() => ({ pendingTransactions })),
      persist: {
        hydrationPromise: vi.fn(() => Promise.resolve()),
      },
      subscribe: vi.fn(),
    },
    watchPendingTransactions: vi.fn(),
  };
});

vi.mock('~/core/state', () => ({
  usePendingTransactionsStore: mocks.usePendingTransactionsStore,
}));

vi.mock('~/core/state/batches', () => ({
  useBatchStore: mocks.useBatchStore,
}));

vi.mock('~/core/state/networks/timing', () => ({
  getMinPollingIntervalForPendingTxs: mocks.getMinPollingIntervalForPendingTxs,
}));

vi.mock(
  '~/core/state/transactions/pendingTransactions/watchPendingTransactions',
  () => ({
    watchPendingTransactions: mocks.watchPendingTransactions,
  }),
);

vi.mock('../procedures/popup/popupPortManager', () => ({
  getActivePopupPortCount: vi.fn(() => mocks.activePopupPortCount),
}));

describe('handleWatchPendingTransactions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.stubGlobal('chrome', {
      runtime: {
        onConnect: {
          addListener: mocks.onConnectAddListener,
        },
      },
    });

    mocks.activePopupPortCount = 0;
    mocks.getMinPollingIntervalForPendingTxs.mockReturnValue(1000);
    mocks.watchPendingTransactions.mockResolvedValue(undefined);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does not mark the initial all-pending poll done after a batch-only cycle', async () => {
    const { handleWatchPendingTransactions } = await import(
      './handleWatchPendingTransactions'
    );

    await handleWatchPendingTransactions();
    await Promise.resolve();

    // Cold start with popup closed: background should poll only batch txs.
    expect(mocks.watchPendingTransactions).toHaveBeenNthCalledWith(
      1,
      { [mocks.address]: [mocks.batchTx] },
      { skipTimedOutTxs: false },
    );

    mocks.activePopupPortCount = 1;

    await vi.advanceTimersByTimeAsync(1000);

    // First popup-open cycle should still run the full initial check.
    expect(mocks.watchPendingTransactions).toHaveBeenNthCalledWith(
      2,
      mocks.pendingTransactions,
      { skipTimedOutTxs: false },
    );

    await vi.advanceTimersByTimeAsync(1000);

    // Later popup-open cycles can skip timed-out txs.
    expect(mocks.watchPendingTransactions).toHaveBeenNthCalledWith(
      3,
      mocks.pendingTransactions,
      { skipTimedOutTxs: true },
    );
  });
});
