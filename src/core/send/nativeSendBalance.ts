/**
 * Whether the account balance (wei) covers native value + max gas fee (wei).
 * Used by send / dApp approval validation hooks.
 */
export function hasEnoughNativeBalanceForSend({
  balanceWei,
  valueWei,
  gasFeeWei,
}: {
  balanceWei: bigint;
  valueWei: bigint;
  gasFeeWei: bigint;
}): boolean {
  return balanceWei >= valueWei + gasFeeWei;
}
