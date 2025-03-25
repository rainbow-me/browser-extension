import { uuid4 } from '@sentry/utils';

import { initFCM } from '~/core/firebase/fcm';
import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state/internal/syncStores';
import { networksStoreMigrationStore } from '~/core/state/networks/migration';
import { networkStore } from '~/core/state/networks/networks';
import { localStorageRecycler } from '~/core/storage/localStorageRecycler';
import { updateWagmiConfig } from '~/core/wagmi';

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
localStorageRecycler();

const popupMessenger = initializeMessenger({ connect: 'popup' });
const inpageMessenger = initializeMessenger({ connect: 'inpage' });

handleInstallExtension();
handleProviderRequest({ popupMessenger, inpageMessenger });
handleTabAndWindowUpdates();
handlePrefetchDappMetadata();
handleSetupInpage();
handleWallets();
handleDisconnect();

const initialNetworksMigrationState = networksStoreMigrationStore.getState();
if (initialNetworksMigrationState.didCompleteNetworksMigration) {
  syncStores();
} else {
  networksStoreMigrationStore.subscribe((state) => {
    if (state.didCompleteNetworksMigration) {
      syncStores();
    }
  });
}

uuid4();
initFCM();
handleKeepAlive();

popupMessenger.reply('rainbow_updateWagmiClient', async () => {
  const activeChains = networkStore.getState().getAllActiveRpcChains();
  updateWagmiConfig(activeChains);
});
