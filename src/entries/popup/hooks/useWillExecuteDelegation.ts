import { useWillDelegate } from '@rainbow-me/delegation';
import type { Address } from 'viem';

import { useRemoteConfig } from '~/core/firebase/remoteConfig';
import { useFeatureFlagsStore } from '~/core/state';
import { KeychainType } from '~/core/types/keychainTypes';

import { useCurrentWalletTypeAndVendor } from './useCurrentWalletType';

/**
 * Returns true when the next swap would execute EIP-7702 delegation
 * (first-time smart wallet activation on the chain).
 *
 * Used for UI copy (e.g. "Smart Wallet Activation Fee") and delegation callouts.
 * Returns false for hardware wallets and when delegation is disabled.
 */
export function useWillExecuteDelegation(
  address: Address,
  chainId: number,
): boolean {
  const { type } = useCurrentWalletTypeAndVendor();
  const isHardwareWallet = type === KeychainType.HardwareWalletKeychain;

  const localDelegationEnabled = useFeatureFlagsStore(
    (s) => s.featureFlags.delegation_enabled,
  );
  const remoteDelegationEnabled = useRemoteConfig('delegation_enabled');
  const delegationEnabled =
    localDelegationEnabled !== null
      ? localDelegationEnabled
      : remoteDelegationEnabled;

  const willDelegate = useWillDelegate(address, chainId);

  if (isHardwareWallet) return false;
  if (!delegationEnabled) return false;
  return willDelegate;
}
