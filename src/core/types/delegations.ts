import { Hash } from 'viem';

export enum RevokeReason {
  DISABLE_SMART_WALLET = 'disable_smart_wallet',
  DISABLE_SINGLE_NETWORK = 'disable_single_network',
  DISABLE_THIRD_PARTY = 'disable_third_party',
  ALERT_VULNERABILITY = 'alert_vulnerability',
  ALERT_BUG = 'alert_bug',
  ALERT_UNRECOGNIZED = 'alert_unrecognized',
  ALERT_UNSPECIFIED = 'alert_unspecified',
}

/**
 * Result of a revoke delegation operation
 */
export interface RevokeDelegationResult {
  txHash?: Hash;
  error: string | null;
}
