// if (process.env.IS_TESTING === 'true') {
//   console.log(
//     '[Background] IS_TESTING is true, initializing mockFetch synchronously...',
//   );
//   try {
//     // Use require instead of dynamic import for synchronous loading
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     const { mockFetch } = require('../../../e2e/mockFetch');
//     mockFetch();
//     console.log('[Background] mockFetch initialized successfully');
//   } catch (e) {
//     console.error('[Background] Failed to initialize mockFetch:', e);
//   }
// }

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
handleKeepAlive();

popupMessenger.reply('rainbow_updateWagmiClient', async () => {
  const activeChains = useNetworkStore.getState().getAllActiveRpcChains();
  updateWagmiConfig(activeChains);
});
