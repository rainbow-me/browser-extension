import { useDelegationPreference } from '@rainbow-me/delegation';
import { Address } from 'viem';

import remoteConfig from '~/core/firebase/remoteConfig';

export function useActivationStatus({ address }: { address: Address }) {
  const preference = useDelegationPreference(address);

  return {
    ...preference,
    // Override enabled to respect feature flag
    enabled: remoteConfig.delegation_enabled && preference.enabled,
    // For backwards compatibility with loading state checks
    isLoading: false,
  };
}
