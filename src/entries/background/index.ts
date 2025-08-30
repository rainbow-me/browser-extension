import { uuid4 } from '@sentry/core';

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
import { handleOpenExtensionShortcut } from './handlers/handleOpenExtensionShortcut';
import { handlePrefetchDappMetadata } from './handlers/handlePrefetchMetadata';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleTabAndWindowUpdates } from './handlers/handleTabAndWindowUpdates';
import { handleWallets } from './handlers/handleWallets';
import { startPopupRouter } from './procedures/popup';

require('../../core/utils/lockdown');

initializeSentry('background');
localStorageRecycler();

handleOpenExtensionShortcut();

startPopupRouter();

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

handleInstallExtension();
handleProviderRequest({ inpageMessenger });
handleTabAndWindowUpdates();
handlePrefetchDappMetadata();
handleSetupInpage();
handleWallets();
handleDisconnect();

syncNetworksStore('background');
syncStores();

uuid4();

const popupMessenger = initializeMessenger({ connect: 'popup' });
popupMessenger.reply('rainbow_updateWagmiClient', async () => {
  const activeChains = useNetworkStore.getState().getAllActiveRpcChains();
  updateWagmiConfig(activeChains);
});
