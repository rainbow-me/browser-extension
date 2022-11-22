import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state';
import { createWagmiClient } from '~/core/wagmi';

import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleSetupInpage } from './handlers/handleSetupInpage';
import { handleWallets } from './handlers/handleWallets';

initializeSentry('background');

const messenger = initializeMessenger({ connect: 'popup' });
createWagmiClient();
handleInstallExtension();
handleProviderRequest({ messenger });
handleSetupInpage();
handleWallets();
syncStores();
