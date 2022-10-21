import { keychainDemo } from '~/core/keychain/_template';
import { createWagmiClient } from '~/core/wagmi';
import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';

createWagmiClient();
handleInstallExtension();
handleProviderRequest();
keychainDemo();
