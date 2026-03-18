import type { RainbowTransaction } from '~/core/types/transactions';

/**
 * Migrates `approvalAmount` from the legacy `string` representation
 * to `bigint`, returning a new record with converted transactions.
 */
export function migrateApprovalAmountToBigInt<K extends string | number>(
  txsByKey: Record<K, RainbowTransaction[]>,
): Record<K, RainbowTransaction[]> {
  return Object.fromEntries(
    Object.entries(txsByKey).map(([key, txs]) => [
      key,
      (txs as RainbowTransaction[]).map(migrateTransaction),
    ]),
  ) as Record<K, RainbowTransaction[]>;
}

function migrateTransaction(tx: RainbowTransaction): RainbowTransaction {
  const raw = tx.approvalAmount;
  if (typeof raw !== 'string' || raw === 'UNLIMITED') return tx;
  try {
    return { ...tx, approvalAmount: BigInt(raw) };
  } catch {
    const { approvalAmount: _, ...rest } = tx;
    return rest as RainbowTransaction;
  }
}
