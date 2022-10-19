import { initializeSentry } from '~/core/sentry';
import { createWagmiClient } from '~/core/wagmi';
import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';

initializeSentry();
createWagmiClient();
handleInstallExtension();
handleProviderRequest();
