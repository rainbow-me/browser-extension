import { backgroundStore } from '~/core/state/backgroundStore';
import { Storage } from '~/core/storage';

/**
 * Sends state changes from the backgroundStore to any other context that might want it.
 */
export const handleBackgroundStoreChange = () =>
  backgroundStore.subscribe(
    ({ currentWindow, pendingRequest, approvedHosts }) => {
      Storage.set('pendingRequest', pendingRequest);
      Storage.set('currentWindow', currentWindow);
      Storage.set('approvedHosts', approvedHosts);
    },
  );
