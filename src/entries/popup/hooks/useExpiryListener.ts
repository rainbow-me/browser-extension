import { useEffect } from 'react';

import { usePopupInstanceStore } from '~/core/state/popupInstances';

export function useExpiryListener() {
  const { resetValues, setupPort } = usePopupInstanceStore();

  const checkExpiry = async () => {
    const expiryEntry = await chrome.storage.local.get('expiry');
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
}
