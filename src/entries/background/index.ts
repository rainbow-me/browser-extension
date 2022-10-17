import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { useCoreStore } from '~/core/state/';

handleInstallExtension();
handleProviderRequest();

// Get data from core store persisted
console.log(useCoreStore.getState());
