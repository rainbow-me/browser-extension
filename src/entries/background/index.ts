import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state';
import { createWagmiClient } from '~/core/wagmi';

import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleWallets } from './handlers/handleWallets';

initializeSentry();
createWagmiClient();
handleInstallExtension();
handleProviderRequest();
handleWallets();
syncStores();
