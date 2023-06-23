import { uuid4 } from '@sentry/utils';

import { initFCM } from '~/core/firebase/fcm';
import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state/internal/syncStores';
import { createWagmiClient } from '~/core/wagmi';

import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleTabAndWindowUpdates } from './handlers/handleTabAndWindowUpdates';
import { handleWallets } from './handlers/handleWallets';
require('../../core/utils/lockdown');

initializeSentry('background');

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
initFCM();
