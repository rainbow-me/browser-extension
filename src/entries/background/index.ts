import { initializeMessenger } from '~/core/messengers';
import { initializeSentry } from '~/core/sentry';
import { syncStores } from '~/core/state';
import { createWagmiClient } from '~/core/wagmi';

import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';

const messenger = initializeMessenger({ connect: 'popup' });
initializeSentry();
createWagmiClient();
handleInstallExtension();
handleProviderRequest({ messenger });
syncStores();
