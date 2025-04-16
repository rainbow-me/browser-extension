import { uuid4 } from '@sentry/utils';

import { initFCM } from '~/core/firebase/fcm';
import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import {
  syncNetworksStore,
  syncStores,
} from '~/core/state/internal/syncStores';
import { useNetworkStore } from '~/core/state/networks/networks';
import { localStorageRecycler } from '~/core/storage/localStorageRecycler';
import { updateWagmiConfig } from '~/core/wagmi';

import { handleDisconnect } from './handlers/handleDisconnect';
import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleKeepAlive } from './handlers/handleKeepAlive';
import { handleOpenExtensionShortcut } from './handlers/handleOpenExtensionShortcut';
import { handlePrefetchDappMetadata } from './handlers/handlePrefetchMetadata';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleTabAndWindowUpdates } from './handlers/handleTabAndWindowUpdates';
import { handleWallets } from './handlers/handleWallets';

require('../../core/utils/lockdown');

initializeSentry('background');
localStorageRecycler();

handleOpenExtensionShortcut();

const popupMessenger = initializeMessenger({ connect: 'popup' });
const inpageMessenger = initializeMessenger({ connect: 'inpage' });

handleInstallExtension();
handleProviderRequest({ popupMessenger, inpageMessenger });
handleTabAndWindowUpdates();
handlePrefetchDappMetadata();
handleSetupInpage();
handleWallets();
handleDisconnect();

syncNetworksStore('background');
syncStores();

uuid4();
// wait until the page is active to initialize FCM
self.addEventListener('activate', () => {
  initFCM();
});
handleKeepAlive();

popupMessenger.reply('rainbow_updateWagmiClient', async () => {
  const activeChains = useNetworkStore.getState().getAllActiveRpcChains();
  updateWagmiConfig(activeChains);
});
