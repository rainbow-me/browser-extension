import { Address } from 'viem';

import { queryClient } from '~/core/react-query';
import { userAssetsFetchQuery } from '~/core/resources/assets/userAssets';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  usePendingTransactionsStore,
} from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import {
  MinedTransaction,
  RainbowTransaction,
} from '~/core/types/transactions';

import { wait } from './handlers/retry';

type ConsolidatedPage = { transactions: RainbowTransaction[] };

const processingKeys = new Set<string>();

const txKey = (tx: { hash: string; chainId: number }) =>
  `${tx.hash}:${tx.chainId}`;

function isConsolidatedTxQuery(
  queryKey: readonly unknown[],
  address: Address,
): boolean {
  return (
    queryKey[1] === 'consolidatedTransactions' &&
    (queryKey[0] as Record<string, unknown>)?.address === address
  );
}

function isChainTxQuery(
  queryKey: readonly unknown[],
  address: Address,
  chainId: number,
): boolean {
  const args = queryKey[0] as Record<string, unknown> | undefined;
  return (
    queryKey[1] === 'transactions' &&
    args?.address === address &&
    args?.chainId === chainId
  );
}

function isTxInConsolidatedCache(
  address: Address,
  hash: string,
  chainId: number,
): boolean {
  const queries = queryClient.getQueriesData<{
    pages?: ConsolidatedPage[];
  }>({
    predicate: (q) => isConsolidatedTxQuery(q.queryKey, address),
  });

  return queries.some(
    ([, data]) =>
      data?.pages?.some(
        (page) =>
          page.transactions?.some(
            (tx) => tx.hash === hash && tx.chainId === chainId,
          ),
      ),
  );
}

async function refetchTxQueries(
  address: Address,
  chainIds: ReadonlySet<number>,
) {
  await Promise.allSettled([
    queryClient.refetchQueries({
      type: 'all',
      predicate: (q) => isConsolidatedTxQuery(q.queryKey, address),
    }),
    ...Array.from(chainIds, (chainId) =>
      queryClient.refetchQueries({
        type: 'all',
        predicate: (q) => isChainTxQuery(q.queryKey, address, chainId),
      }),
    ),
  ]);
}

function tryRemoveMinedTxs(
  address: Address,
  txs: readonly MinedTransaction[],
): boolean {
  const supportedTransactionsChainIds = useNetworkStore
    .getState()
    .getSupportedTransactionsChainIds();

  // Same predicate as watchPendingTransactions: non-Addys chains never hit consolidated
  // history, so waiting for cache would leave pending rows stuck (isCustomChain missed
  // backend-known chains without Addys).
  const toRemove = txs.filter(
    (tx) =>
      !supportedTransactionsChainIds.includes(tx.chainId) ||
      isTxInConsolidatedCache(address, tx.hash, tx.chainId),
  );

  if (toRemove.length > 0) {
    usePendingTransactionsStore.getState().removePendingTransactionsForAddress({
      address,
      transactionsToRemove: toRemove.map((tx) => ({
        hash: tx.hash,
        chainId: tx.chainId,
      })),
    });

    toRemove.forEach((tx) => processingKeys.delete(txKey(tx)));
  }

  return toRemove.length === txs.length;
}

async function cleanupMinedTransactions(
  txs: readonly MinedTransaction[],
  address: Address,
) {
  const chainIds = new Set(txs.map((tx) => tx.chainId));

  /* eslint-disable no-await-in-loop -- intentionally sequential retries */
  for (const delay of [1500, 5000, 10000]) {
    await wait(delay);
    await refetchTxQueries(address, chainIds);
    if (tryRemoveMinedTxs(address, txs)) return;
  }
  /* eslint-enable no-await-in-loop */

  // All retries exhausted — release the processing lock so subsequent store
  // updates can retry txs that the API was too slow to index.
  txs.forEach((tx) => processingKeys.delete(txKey(tx)));
}

function handlePendingTransactionsChange() {
  const address = useCurrentAddressStore.getState().currentAddress;
  if (!address) return;

  const txs =
    usePendingTransactionsStore.getState().pendingTransactions[address] || [];

  const newlyMined = txs.filter(
    (tx): tx is MinedTransaction =>
      tx.status !== 'pending' && !processingKeys.has(txKey(tx)),
  );
  if (!newlyMined.length) return;

  newlyMined.forEach((tx) => processingKeys.add(txKey(tx)));

  const { currentCurrency } = useCurrentCurrencyStore.getState();

  userAssetsFetchQuery({ address, currency: currentCurrency });
  cleanupMinedTransactions(newlyMined, address);
}

/**
 * Subscribes to the pending transactions store and triggers React Query
 * refetch + cleanup when a transaction transitions from pending to mined.
 * Also re-evaluates when the active address changes, so mined txs for the
 * newly selected address are cleaned up immediately.
 * Runs outside the React render cycle to avoid dependency instability.
 *
 * Ideally all transaction lifecycle management would live in the background
 * service worker, with the popup simply rendering whatever state the background
 * provides. Today the popup owns its own React Query caches for transactions
 * and assets, so this cleanup logic must run in the popup thread to keep those
 * caches in sync. If we move to a model where the background fully manages
 * transaction and asset data, this module can be removed.
 */
export async function setupPendingTransactionCleanup() {
  await useCurrentAddressStore.persist.hydrationPromise();
  handlePendingTransactionsChange();

  const unsubPending = usePendingTransactionsStore.subscribe(
    (s) => s.pendingTransactions,
    handlePendingTransactionsChange,
  );
  const unsubAddress = useCurrentAddressStore.subscribe(
    (s) => s.currentAddress,
    handlePendingTransactionsChange,
  );

  return () => {
    unsubPending();
    unsubAddress();
  };
}
