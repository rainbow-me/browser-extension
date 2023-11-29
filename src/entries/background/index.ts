import { uuid4 } from '@sentry/utils';

import { initFCM } from '~/core/firebase/fcm';
import config from '~/core/firebase/remoteConfig';
import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state/internal/syncStores';
import { getCustomChains } from '~/core/utils/chains';
import { createWagmiClient } from '~/core/wagmi';

import { handleDisconnect } from './handlers/handleDisconnect';
import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleKeepAlive } from './handlers/handleKeepAlive';
import { handlePrefetchDappMetadata } from './handlers/handlePrefetchMetadata';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleTabAndWindowUpdates } from './handlers/handleTabAndWindowUpdates';
import { handleWallets } from './handlers/handleWallets';
require('../../core/utils/lockdown');

initializeSentry('background');

const updateWagmiClient = () => {
  const { customChains } = getCustomChains();
  createWagmiClient({ customChains, useProxy: config.rpc_proxy_enabled });
};

const popupMessenger = initializeMessenger({ connect: 'popup' });
const inpageMessenger = initializeMessenger({ connect: 'inpage' });

handleInstallExtension();
handleProviderRequest({ popupMessenger, inpageMessenger });
handleTabAndWindowUpdates();
handlePrefetchDappMetadata();
handleSetupInpage();
handleWallets();
handleDisconnect();
syncStores();
uuid4();
initFCM();
handleKeepAlive();

setTimeout(() => {
  updateWagmiClient();
}, 100);

popupMessenger.reply('rainbow_updateWagmiClient', async () => {
  updateWagmiClient();
});
