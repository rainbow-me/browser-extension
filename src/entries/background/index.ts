import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state';
import { createWagmiClient } from '~/core/wagmi';

import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';

initializeSentry();
createWagmiClient();
handleInstallExtension();
handleProviderRequest();
syncStores();
