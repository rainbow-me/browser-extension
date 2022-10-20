import { useEffect, useState } from 'react';
import { refractionAddressWs } from '~/core/network';

type UseAddressSocketArgs = {
  address?: string;
  currency?: string;
};

export function useAddressSocket({ address, currency }: UseAddressSocketArgs) {
  const [currentAddress, setCurrentAddress] =
    useState<UseAddressSocketArgs['address']>(address);
  const [currentCurrency, setCurrentCurrency] =
    useState<UseAddressSocketArgs['currency']>(currency);
  useEffect(() => {
    if (currentAddress !== address || currentCurrency !== currency) {
      setCurrentAddress(address);
      setCurrentCurrency(currency);
      refractionAddressWs.removeAllListeners();
    }
  }, [address, currency, currentAddress, currentCurrency]);
  return { addressSocket: refractionAddressWs };
}
