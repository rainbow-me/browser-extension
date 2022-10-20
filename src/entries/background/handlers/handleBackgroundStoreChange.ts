import { backgroundStore } from '~/core/state/backgroundStore';
import { Storage } from '~/core/storage';

/**
 * Sends state changes from the backgroundStore to any other context that might want it.
 */
export const handleCoreStoreChange = () =>
  backgroundStore.subscribe(({ pendingRequests }) => {
    Storage.set('pendingRequests', pendingRequests);
  });
