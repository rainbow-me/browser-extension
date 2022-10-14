import { handleInstallExtension } from './handlers/handleInstallExtension';
import { handleProviderRequest } from './handlers/handleProviderRequest';
import { useCoreStore } from '~/core/state/';

handleInstallExtension();
handleProviderRequest();

// Listen to all events from core store
const unsubscribe = useCoreStore.subscribe(console.log);
