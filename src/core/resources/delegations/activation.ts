import {
  disableDelegation,
  enableDelegation,
  useDelegationDisabled,
} from '@rainbow-me/delegation';
import { useCallback } from 'react';
import { Address } from 'viem';

import remoteConfig from '~/core/firebase/remoteConfig';

export function useActivationStatus({ address }: { address: Address }) {
  const disabled = useDelegationDisabled(address);

  const enable = useCallback(() => enableDelegation(address), [address]);
  const disable = useCallback(() => disableDelegation(address), [address]);

  return {
    enabled: remoteConfig.delegation_enabled && !disabled,
    isLoading: false,
    enable,
    disable,
  };
}
