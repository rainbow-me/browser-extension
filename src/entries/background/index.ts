import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { handleBackgroundStoreChange } from './handlers/handleBackgroundStoreChange';

handleInstallExtension();
handleProviderRequest();
handleBackgroundStoreChange();
