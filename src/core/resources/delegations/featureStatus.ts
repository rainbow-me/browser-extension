import {
  isDelegationEnabled,
  useDelegationDisabled,
} from '@rainbow-me/delegation';
import type { Address } from 'viem';

import config, { useRemoteConfig } from '~/core/firebase/remoteConfig';
import { useFeatureFlagLocalOverwriteStore } from '~/core/state/currentSettings/featureFlags';

/**
 * Delegation and atomic-swap feature status.
 *
 * Two layers:
 * - Feature flags (delegation_enabled, atomic_swaps_enabled): local override or remote config
 * - SDK user opt-out (isDelegationEnabled): per-address preference when user disables smart wallet
 *
 * Use sync getters in background; hooks in popup.
 */
function resolveFlag(local: boolean | null, remote: boolean): boolean {
  return local !== null ? local : remote ?? false;
}

/** Sync: feature flag only. Background only. */
export function getDelegationEnabled(): boolean {
  const local =
    useFeatureFlagLocalOverwriteStore.getState().featureFlags
      .delegation_enabled;
  return resolveFlag(local, config.delegation_enabled ?? false);
}

/** Sync: feature flag only. Background only. */
export function getAtomicSwapsEnabled(): boolean {
  const local =
    useFeatureFlagLocalOverwriteStore.getState().featureFlags
      .atomic_swaps_enabled;
  return resolveFlag(local, config.atomic_swaps_enabled ?? false);
}

/**
 * Sync: feature flag + SDK user opt-out. Background only.
 * Use when you need "can this address use delegation?" without async supportsDelegation.
 */
export function getDelegationAvailable(address: Address): boolean {
  return getDelegationEnabled() && isDelegationEnabled(address);
}

/** Hook: feature flag only. Popup only. */
export function useDelegationEnabled(): boolean {
  const local = useFeatureFlagLocalOverwriteStore(
    (s) => s.featureFlags.delegation_enabled,
  );
  const remote = useRemoteConfig('delegation_enabled');
  return resolveFlag(local, remote ?? false);
}

/** Hook: feature flag only. Popup only. */
export function useAtomicSwapsEnabled(): boolean {
  const local = useFeatureFlagLocalOverwriteStore(
    (s) => s.featureFlags.atomic_swaps_enabled,
  );
  const remote = useRemoteConfig('atomic_swaps_enabled');
  return resolveFlag(local, remote ?? false);
}

/** Hook: feature flag + SDK user opt-out. Popup only. */
export function useDelegationAvailable(address: Address): boolean {
  const enabled = useDelegationEnabled();
  const optedOut = useDelegationDisabled(address);
  return enabled && !optedOut;
}
