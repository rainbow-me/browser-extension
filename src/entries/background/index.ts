import { uuid4 } from '@sentry/utils';
import type { Browser } from 'webextension-polyfill';

import { analytics } from '~/analytics';
import { initFCM } from '~/core/firebase/fcm';
import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state/internal/syncStores';
import { localStorageRecycler } from '~/core/storage/localStorageRecycler';
import { getRainbowChains } from '~/core/utils/rainbowChains';
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

declare const browser: Browser;

const browserType = process.env.BROWSER;

const browserAPI = (() => {
  switch (browserType) {
    case 'firefox':
      return {
        commands: browser.commands,
        openPopup: () => browser.browserAction.openPopup(),
      };
    case 'chrome':
    default:
      return {
        commands: chrome.commands,
        openPopup: () => chrome.action.openPopup(),
      };
  }
})();

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
  const { rainbowChains } = getRainbowChains();
  updateWagmiConfig(rainbowChains);
});

browserAPI.commands.onCommand.addListener((command: string) => {
  if (command === 'open_rainbow') {
    browserAPI.openPopup();
    analytics.track(analytics.event.extensionOpenViaShortcut);
  }
});
