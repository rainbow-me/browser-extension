import { uuid4 } from '@sentry/utils';

import { analytics } from '~/analytics';
import { initFCM } from '~/core/firebase/fcm';
import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state/internal/syncStores';
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
syncStores();
uuid4();
initFCM();
handleKeepAlive();

popupMessenger.reply('rainbow_updateWagmiClient', async () => {
  const activeChains = networkStore.getState().getAllActiveRpcChains();
  updateWagmiConfig(activeChains);
});

// firefox maps chrome > browser, but it does still use
// `browserAction` for manifest v2 & v3. in v3 chrome uses `action`
const openPopup = () => (chrome.action || chrome.browserAction).openPopup();

chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_rainbow') {
    openPopup();
    analytics.track(analytics.event.browserCommandTriggered, {
      command: 'launched',
    });
  }
});
