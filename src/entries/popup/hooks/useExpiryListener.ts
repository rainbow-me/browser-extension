import { useEffect } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { usePopupInstanceStore } from '~/core/state/popupInstances';

import usePrevious from './usePrevious';

export function useExpiryListener() {
  const { resetValues, setupPort } = usePopupInstanceStore();
  const { currentAddress } = useCurrentAddressStore();
  const previousAddress = usePrevious(currentAddress);

  const checkExpiry = async () => {
    const expiryEntry = await chrome.storage.session.get('expiry');
    const expired = Date.now() > (expiryEntry?.expiry || 0);
    if (expired) {
      await resetValues();
    }
  };

  useEffect(() => {
    // this port's disconnection will let the background know to register a new expiry date
    setupPort();
    // reset popup instance data if the expiry date has passed
    checkExpiry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (previousAddress !== currentAddress) {
      resetValues();
    }
  });
}
