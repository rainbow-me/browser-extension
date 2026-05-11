import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const address = '0x1234567890abcdef1234567890abcdef12345678';
  let activePopupPortCount = 0;
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
    address,
    batchTx,
    getBatchKeysForNonce: vi.fn((nonce, chainId, sender) => {
      return nonce === batchTx.nonce && chainId === 1 && sender === address
        ? ['batch']
        : [];
    }),
    getMinPollingIntervalForPendingTxs: vi.fn(),
    pendingTransactions,
    popupPortLifecycleListeners: new Set<() => void>(),
    regularTx,
    setActivePopupPortCount: (count: number) => {
      activePopupPortCount = count;
    },
    usePendingTransactionsStore: {
      getState: vi.fn(() => ({ pendingTransactions })),
      persist: {
        hydrationPromise: vi.fn(() => Promise.resolve()),
      },
      subscribe: vi.fn(),
    },
    watchPendingTransactions: vi.fn(),
    get activePopupPortCount() {
      return activePopupPortCount;
    },
  };
});

vi.mock('~/core/state', () => ({
  usePendingTransactionsStore: mocks.usePendingTransactionsStore,
}));

vi.mock('~/core/state/batches/updateBatchStatus', () => ({
  getBatchKeysForNonce: mocks.getBatchKeysForNonce,
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
  addPopupPortLifecycleListener: vi.fn((listener: () => void) => {
    mocks.popupPortLifecycleListeners.add(listener);
    return () => {
      mocks.popupPortLifecycleListeners.delete(listener);
    };
  }),
  isPopupOpen: vi.fn(() => mocks.activePopupPortCount > 0),
}));

describe('handleWatchPendingTransactions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();

    mocks.setActivePopupPortCount(0);
    mocks.popupPortLifecycleListeners.clear();
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

    mocks.setActivePopupPortCount(1);

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

  it('reschedules through the popup port lifecycle listener', async () => {
    const { addPopupPortLifecycleListener } = await import(
      '../procedures/popup/popupPortManager'
    );
    const { handleWatchPendingTransactions } = await import(
      './handleWatchPendingTransactions'
    );

    mocks.getMinPollingIntervalForPendingTxs.mockImplementation((txs) =>
      txs === mocks.pendingTransactions ? 100 : 1000,
    );

    await handleWatchPendingTransactions();

    expect(addPopupPortLifecycleListener).toHaveBeenCalledWith(
      expect.any(Function),
    );

    mocks.setActivePopupPortCount(1);
    expect(mocks.popupPortLifecycleListeners.size).toBe(1);
    mocks.popupPortLifecycleListeners.forEach((listener) => listener());

    await vi.advanceTimersByTimeAsync(100);

    expect(mocks.watchPendingTransactions).toHaveBeenNthCalledWith(
      2,
      mocks.pendingTransactions,
      { skipTimedOutTxs: false },
    );
  });
});
