import { createWagmiClient } from '~/core/wagmi';
import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleBackgroundStoreChange } from './handlers/handleBackgroundStoreChange';

createWagmiClient();
handleInstallExtension();
handleProviderRequest();
handleBackgroundStoreChange();
