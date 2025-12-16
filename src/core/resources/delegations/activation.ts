import {
  disableDelegation,
  enableDelegation,
  useDelegations,
} from '@rainbow-me/delegation';
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
 * isActive when: on-chain delegations exist OR (feature flag on and user has not opted out).
 * Fixes: delegation_enabled=false should still show "Active" when user has delegations.
 */
export function useActivationStatus({
  address,
}: {
  address: Address;
}): ActivationStatus {
  const delegationAvailable = useDelegationAvailable(address);
  const delegations = useDelegations(address);

  const isActive = (delegations?.length ?? 0) > 0 || delegationAvailable;

  const enable = useCallback(() => enableDelegation(address), [address]);
  const disable = useCallback(() => disableDelegation(address), [address]);

  return {
    isActive,
    enable,
    disable,
  };
}
