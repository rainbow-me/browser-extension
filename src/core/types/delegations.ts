import { Address } from 'viem';

import { ChainId } from './chains';

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
}

/**
 * Delegation status from SDK (not exported as separate type, but part of ChainDelegation)
 */
export type DelegationStatus = 'RAINBOW_DELEGATED' | 'THIRD_PARTY_DELEGATED';

/**
 * Revoke reason from SDK (not exported as separate type, but part of ChainDelegation)
 */
export type RevokeReason = 'VULNERABILITY' | 'BUG' | null;

/**
 * Update reason from SDK (not exported as separate type, but part of ChainDelegation)
 */
export type UpdateReason = 'UPGRADE_AVAILABLE' | 'RAINBOW_ONBOARDING' | null;

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
 * Status of the revoke delegation operation
 */
export type RevokeStatus =
  | 'notReady' // Preparing data necessary to revoke
  | 'ready' // Ready to revoke
  | 'claiming' // User has pressed the revoke button
  | 'pending' // Revoke has been submitted but no tx hash yet
  | 'success' // Revoke has been submitted and we have a tx hash
  | 'recoverableError' // Revoke or auth has failed, can try again
  | 'unrecoverableError'; // Revoke has failed, unrecoverable error

/**
 * Result of a revoke delegation operation
 */
export interface RevokeDelegationResult {
  txHash?: `0x${string}`;
  error: string | null;
}
