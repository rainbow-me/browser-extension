try {
  importScripts('./vendor/trezor-connect-webextension.js');
} catch (e) {
  console.log('error importing Trezor script: ', e);
}
import { uuid4 } from '@sentry/utils';

import { initFCM } from '~/core/firebase/fcm';
import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state/internal/syncStores';
import { initializeTrezor } from '~/core/trezor/initializeTrezor';
import { getRainbowChains } from '~/core/utils/chains';
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

initializeTrezor();
initializeSentry('background');

const updateWagmiClient = ({
  rpcProxyEnabled,
}: {
  rpcProxyEnabled: boolean;
}) => {
  const { rainbowChains } = getRainbowChains();
  createWagmiClient({ rainbowChains, useProxy: rpcProxyEnabled });
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
  updateWagmiClient({ rpcProxyEnabled: true });
}, 100);

popupMessenger.reply(
  'rainbow_updateWagmiClient',
  async (payload: { rpcProxyEnabled: boolean }) => {
    updateWagmiClient({ rpcProxyEnabled: payload.rpcProxyEnabled });
  },
);
