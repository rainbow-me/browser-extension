import { uuid4 } from '@sentry/utils';

import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state';
import { createWagmiClient } from '~/core/wagmi';

import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleWallets } from './handlers/handleWallets';
require('../../core/utils/lockdown');

initializeSentry('background');

const messenger = initializeMessenger({ connect: 'popup' });
createWagmiClient();
handleInstallExtension();
handleProviderRequest({ messenger });
handleSetupInpage();
handleWallets();
syncStores();
uuid4();
