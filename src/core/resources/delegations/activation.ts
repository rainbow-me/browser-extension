import { disableDelegation, enableDelegation } from '@rainbow-me/delegation';
import { useCallback } from 'react';
import type { Address } from 'viem';

import { useDelegationAvailable } from '~/core/resources/delegations/featureStatus';

export interface ActivationStatus {
  isActive: boolean;
  enable: () => void;
  disable: () => void;
}

/**
 * Smart wallet activation status.
 * isActive reflects the user's opt-in preference (feature flag + SDK),
 * independent of whether on-chain delegations still exist.
 */
export function useActivationStatus({
  address,
}: {
  address: Address;
}): ActivationStatus {
  const delegationAvailable = useDelegationAvailable(address);

  const isActive = delegationAvailable;

  const enable = useCallback(() => enableDelegation(address), [address]);
  const disable = useCallback(() => disableDelegation(address), [address]);

  return {
    isActive,
    enable,
    disable,
  };
}
