import { useEffect } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useNavRestorationStore } from '~/core/state/navRestoration';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { SessionStorage } from '~/core/storage';

import usePrevious from './usePrevious';

export function useExpiryListener() {
  const { resetValues, setupPort } = usePopupInstanceStore();
  const { currentAddress } = useCurrentAddressStore();
  const clearLastPage = useNavRestorationStore.use.clearLastPage();
  const lastPage = useNavRestorationStore.use.lastPage();
  const setShouldRestoreNavigation =
    useNavRestorationStore.use.setShouldRestoreNavigation();
  const previousAddress = usePrevious(currentAddress);

  const checkExpiry = async () => {
    const expiry = await SessionStorage.get('expiry');
    const expired = Date.now() > (expiry || 0);
    if (expired) {
      await resetValues();
      await clearLastPage();
    }
    setShouldRestoreNavigation(!!lastPage);
  };

  useEffect(() => {
    // this port's disconnection will let the background know to register a new expiry date
    setupPort();
    // reset popup instance data if the expiry date has passed
    checkExpiry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (previousAddress && previousAddress !== currentAddress) {
      resetValues();
    }
  }, [currentAddress, previousAddress, resetValues]);
}
