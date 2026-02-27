import {
  isDelegationEnabled,
  useDelegationDisabled,
} from '@rainbow-me/delegation';
import type { Address } from 'viem';

import config, { useRemoteConfig } from '~/core/firebase/remoteConfig';
import { useFeatureFlagStore } from '~/core/state/currentSettings/featureFlags';

/**
 * Delegation and atomic-swap feature status.
 *
 * Local feature flag (dev settings) can force-enable; remote config is the production source of truth.
 * SDK user opt-out (isDelegationEnabled) is a per-address preference when user disables smart wallet.
 */

/** Sync: feature flag only. Background only. */
export function getDelegationEnabled(): boolean {
  return (
    useFeatureFlagStore.getState().featureFlags.delegation_enabled ||
    config.delegation_enabled
  );
}

/** Sync: feature flag only. Background only. */
export function getAtomicSwapsEnabled(): boolean {
  return (
    useFeatureFlagStore.getState().featureFlags.atomic_swaps_enabled ||
    config.atomic_swaps_enabled
  );
}

/** Sync: feature flag + SDK user opt-out. Background only. */
export function getDelegationAvailable(address: Address): boolean {
  return getDelegationEnabled() && isDelegationEnabled(address);
}

/** Hook: feature flag only. Popup only. */
export function useDelegationEnabled(): boolean {
  const local = useFeatureFlagStore((s) => s.featureFlags.delegation_enabled);
  const remote = useRemoteConfig('delegation_enabled');
  return local || remote;
}

/** Hook: feature flag only. Popup only. */
export function useAtomicSwapsEnabled(): boolean {
  const local = useFeatureFlagStore((s) => s.featureFlags.atomic_swaps_enabled);
  const remote = useRemoteConfig('atomic_swaps_enabled');
  return local || remote;
}

/** Hook: feature flag + SDK user opt-out. Popup only. */
export function useDelegationAvailable(address: Address): boolean {
  const enabled = useDelegationEnabled();
  const optedOut = useDelegationDisabled(address);
  return enabled && !optedOut;
}
