import type { TransactionReceipt } from '@ethersproject/abstract-provider';
import type { Address, Hash, Hex, WalletCallReceipt } from 'viem';

import { getProvider } from '~/core/viem/clientToProvider';

import { BatchStatus, type BatchStatusValue, useBatchStore } from '../index';

export type MinedTxInfo = {
  nonce: number;
  chainId: number;
  sender: Address;
  hash: Hash;
  isCancellation: boolean;
};

/**
 * Returns batch keys matching a nonce + chainId + sender.
 * Nonce is immutable across speedup/cancel, making this a stable lookup.
 */
export function getBatchKeysForNonce(
  nonce: number,
  chainId: number,
  sender: Address,
): string[] {
  const { batches } = useBatchStore.getState();
  const senderLower = sender.toLowerCase();
  return Object.entries(batches)
    .filter(
      ([, batch]) =>
        batch.nonces.includes(nonce) &&
        batch.chainId === chainId &&
        batch.sender.toLowerCase() === senderLower,
    )
    .map(([key]) => key);
}

/**
 * When a pending tx on a batch nonce is resolved (mined or nonce detected
 * as used), finds matching batches and updates their status.
 *
 * Handles:
 * - Normal confirmation/failure
 * - Cancel confirmed → CompleteRevert
 * - Cancel too late (original wins) → Confirmed
 */
export async function updateBatchesForMinedTx(
  tx: MinedTxInfo,
): Promise<number> {
  const batchKeys = getBatchKeysForNonce(tx.nonce, tx.chainId, tx.sender);
  await Promise.all(
    batchKeys.map((key) =>
      updateBatchStatusFromReceipt(key, tx).catch(() => undefined),
    ),
  );
  return batchKeys.length;
}

/**
 * Resolves batch status after a nonce is confirmed.
 * Callers should pass the mined hash and `typeOverride` from Rainbow backend
 * when available (see popup pending watcher); `isCancellation` is not inferred on-chain.
 */
async function updateBatchStatusFromReceipt(
  batchKey: string,
  minedTx: MinedTxInfo,
): Promise<void> {
  const batch = useBatchStore.getState().batches[batchKey];
  if (!batch) return;

  const provider = getProvider({ chainId: batch.chainId });
  const receipt = await fetchReceipt(minedTx.hash, provider);

  let newStatus: BatchStatusValue;
  let callReceipt: WalletCallReceipt | undefined;

  if (receipt) {
    callReceipt = toCallReceipt(receipt);
    const confirmed = receipt.status === 1;

    if (minedTx.isCancellation && confirmed) {
      newStatus = BatchStatus.CompleteRevert;
    } else {
      newStatus = confirmed
        ? BatchStatus.Confirmed
        : BatchStatus.CompleteRevert;
    }
  } else {
    newStatus = BatchStatus.Confirmed;
  }

  useBatchStore.getState().setBatch({
    ...batch,
    status: newStatus,
    ...(callReceipt && { receipts: [callReceipt] }),
  });
}

function toCallReceipt(receipt: TransactionReceipt): WalletCallReceipt {
  return {
    logs: receipt.logs.map((log) => ({
      address: log.address as Address,
      data: log.data as Hex,
      topics: log.topics as Hex[],
    })),
    status: `0x${receipt.status}` as Hex,
    blockHash: receipt.blockHash as Hash,
    blockNumber: `0x${receipt.blockNumber.toString(16)}` as Hex,
    gasUsed: `0x${receipt.gasUsed.toHexString().slice(2)}` as Hex,
    transactionHash: receipt.transactionHash as Hash,
  };
}

async function fetchReceipt(
  hash: Hash,
  provider: ReturnType<typeof getProvider>,
): Promise<TransactionReceipt | null> {
  try {
    return (await provider.getTransactionReceipt(hash)) ?? null;
  } catch {
    return null;
  }
}
