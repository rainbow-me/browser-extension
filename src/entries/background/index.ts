import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state';
import { createWagmiClient } from '~/core/wagmi';

import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleWallets } from './handlers/handleWallets';

const messenger = initializeMessenger({ connect: 'popup' });

initializeSentry();
createWagmiClient();
handleInstallExtension();
handleProviderRequest({ messenger });
handleWallets();
syncStores();

chrome.scripting.registerContentScripts([
  {
    id: 'inpage',
    matches: ['file://*/*', 'http://*/*', 'https://*/*'],
    js: ['inpage.js'],
    runAt: 'document_start',
    world: 'MAIN',
  },
]);
