import { useEffect } from 'react';

import { analytics } from '~/analytics';
import { getWalletContext } from '~/analytics/util';
import { useAuth } from '~/entries/popup/hooks/useAuth';

import { setSentryUser } from '../sentry';
import { useCurrentAddressStore, useDeviceIdStore } from '../state';

export const TelemetryIdentifier = () => {
  const { status: authStatus } = useAuth();
  const { deviceId } = useDeviceIdStore();
  const { currentAddress } = useCurrentAddressStore();

  // update telemetry wallet each time selected wallet changes
  useEffect(() => {
    // update wallet context and trigger identify
    const identify = async () => {
      const { walletType, walletAddressHash } =
        await getWalletContext(currentAddress);
      setSentryUser({ deviceId, walletAddressHash, walletType });
      // allows calling telemetry before currentAddress is available (i.e. onboarding)
      if (walletType || walletAddressHash)
        analytics.setWalletContext({ walletAddressHash, walletType });
      analytics.setDeviceId(deviceId);
      analytics.identify();
    };
    // Disable analytics & sentry for e2e and dev mode
    if (process.env.IS_TESTING !== 'true' && process.env.IS_DEV !== 'true') {
      if (authStatus === '') return; // wait for auth state to settle
      else if (authStatus === 'READY') identify(); // assign full wallet context
      else identify(); // assign partial wallet context immediately if available
    }
  }, [deviceId, currentAddress, authStatus]);

  return null;
};
