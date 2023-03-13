import { uuid4 } from '@sentry/utils';

import { analytics } from '~/analytics';
import { initializeMessenger } from '~/core/messengers';
import { initializeSentry, setSentryUser } from '~/core/sentry';
import { deviceIdStore, syncStores } from '~/core/state';
import { createWagmiClient } from '~/core/wagmi';

import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleTabAndWindowUpdates } from './handlers/handleTabAndWindowUpdates';
import { handleWallets } from './handlers/handleWallets';
require('../../core/utils/lockdown');

// Disable analytics and sentry for e2e and dev mode
if (process.env.IS_TESTING !== 'true' && process.env.IS_DEV !== 'true') {
  initializeSentry('background');
  const { deviceId } = deviceIdStore.getState();
  setSentryUser(deviceId);
  analytics.setDeviceId(deviceId);
  analytics.identify();
}

const popupMessenger = initializeMessenger({ connect: 'popup' });
const inpageMessenger = initializeMessenger({ connect: 'inpage' });

createWagmiClient();
handleInstallExtension();
handleProviderRequest({ popupMessenger, inpageMessenger });
handleTabAndWindowUpdates();
handleSetupInpage();
handleWallets();
syncStores();
uuid4();
