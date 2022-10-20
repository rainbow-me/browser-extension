import { useEffect, useState } from 'react';
import { refractionAddressWs, refractionAssetsWs } from '~/core/network';

type UseAccountSwitcherArgs = {
  address?: string;
};

/**
 * Perform necessary account switching behavior here
 * TODO: this should be refactored to use wagmi.useAccount for address. This prop is for testing.
 * */
export function useAccountSwitcher({ address }: UseAccountSwitcherArgs) {
  const [currentAddress, setCurrentAddress] =
    useState<UseAccountSwitcherArgs['address']>(address);
  useEffect(() => {
    if (currentAddress !== address) {
      setCurrentAddress(address);
      refractionAddressWs.removeAllListeners();
      refractionAssetsWs.removeAllListeners();
    }
  }, [address, currentAddress]);
}
