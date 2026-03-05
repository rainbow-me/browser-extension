import { getProvider } from '~/core/viem/clientToProvider';

import { BatchStatus, useBatchStore } from '../index';

/**
 * Returns batch keys that contain the given tx hash and chainId.
 */
export function getBatchKeysContainingTx(
  txHash: string,
  chainId: number,
): string[] {
  const { batches } = useBatchStore.getState();
  return Object.entries(batches)
    .filter(
      ([, batch]) =>
        batch.chainId === chainId &&
        batch.txHashes.includes(txHash as `0x${string}`),
    )
    .map(([key]) => key);
}

/**
 * For a confirmed/failed tx, finds all batches containing it and updates their status.
 * @returns Number of batches that matched and were updated.
 */
export async function updateBatchesForTx(
  txHash: string,
  chainId: number,
): Promise<number> {
  const batchKeys = getBatchKeysContainingTx(txHash, chainId);
  await Promise.all(
    batchKeys.map((key) =>
      updateBatchStatusFromReceipts(key).catch(() => undefined),
    ),
  );
  return batchKeys.length;
}

/**
 * Fetches receipts for all batch tx hashes and updates batch status when complete.
 */
export async function updateBatchStatusFromReceipts(
  batchKey: string,
): Promise<void> {
  const batch = useBatchStore.getState().batches[batchKey];
  if (!batch) return;

  const provider = getProvider({ chainId: batch.chainId });
  const statuses = await Promise.all(
    batch.txHashes.map(async (hash) => {
      try {
        const receipt = await provider.getTransactionReceipt(hash);
        return receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : null;
      } catch {
        return null;
      }
    }),
  );

  if (statuses.some((s) => s === null)) return;

  const failedCount = statuses.filter((s) => s === 'failed').length;
  const newStatus =
    failedCount === 0
      ? BatchStatus.Confirmed
      : failedCount === batch.txHashes.length
      ? BatchStatus.CompleteRevert
      : BatchStatus.PartialRevert;

  useBatchStore.getState().setBatch({ ...batch, status: newStatus });
}
