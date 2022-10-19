import { backgroundStore } from '~/core/state';
import { backgroundStoreTransport } from '~/core/transports';

/**
 * Sends state changes from the backgroundStore to any other context that might want it.
 */
export const handleCoreStoreChange = () =>
  backgroundStore.subscribe((state) => {
    backgroundStoreTransport.send(state);
  });
