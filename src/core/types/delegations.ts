import { DelegationStatus } from '@rainbow-me/delegation';
import { Address } from 'viem';

import { ChainId } from './chains';

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
 * Represents a delegation on a chain
 * contractAddress is optional - only present for Rainbow delegations
 * Third-party delegations don't have a contract address
 * isThirdParty indicates if this is a third-party delegation (vs Rainbow delegation)
 */
export interface ChainDelegation {
  chainId: number;
  contractAddress?: Address;
  isThirdParty: boolean;
  /** Contract address to revoke, present when revokeReason is set */
  revokeAddress?: Address;
  /** Current delegation contract name, present when delegated to Rainbow */
  currentContractName?: string;
  /** Delegation status from SDK */
  delegationStatus?: DelegationStatus;
}

/**
 * Represents a delegation that should be revoked
 * contractAddress is optional - only present for Rainbow delegations
 * Third-party delegations can be revoked without a contract address
 */
export interface DelegationToRevoke {
  chainId: ChainId;
  contractAddress?: Address;
}

/**
 * Result of a revoke delegation operation
 */
export interface RevokeDelegationResult {
  txHash?: `0x${string}`;
  error: string | null;
}
