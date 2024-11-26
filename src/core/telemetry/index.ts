import { useEffect } from 'react';

import { analytics } from '~/analytics';
import { getWalletContext } from '~/analytics/util';
import { getStatus } from '~/entries/popup/handlers/wallet';
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

    // check if the keychain is ready for a full identify
    const identifyWhenReady = async () => {
      let status = await getStatus();
      // if it's not ready, storage can throw and we wouldn't get the ready flag
      while (!status.ready || !status.unlocked) {
        // wait till the keychain bootstrap is done
        // eslint-disable-next-line no-promise-executor-return, no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 100));
        // eslint-disable-next-line no-await-in-loop
        status = await getStatus();
      }
      await identify();
    };

    // Disable analytics & sentry for e2e and dev mode
    if (process.env.IS_TESTING !== 'true' && process.env.IS_DEV !== 'true') {
      if (authStatus === 'READY')
        identifyWhenReady(); // wait for the keychain to be ready for a full identify
      else if (authStatus !== '')
        // wait for auth state to settle
        identify(); // assign partial wallet context immediately if available
    }
  }, [deviceId, currentAddress, authStatus]);

  return null;
};
