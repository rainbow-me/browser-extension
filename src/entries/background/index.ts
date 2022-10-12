import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { createWagmiClient } from '~/core/wagmi';

handleInstallExtension();
handleProviderRequest();
createWagmiClient();
