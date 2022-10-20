import { backgroundStore } from '~/core/state/backgroundStore';
import { backgroundStoreTransport } from '~/core/transports';

/**
 * Sends state changes from the backgroundStore to any other context that might want it.
 */
export const handleBackgroundStoreChange = () =>
  backgroundStore.subscribe((state) => {
    backgroundStoreTransport.send(state);
  });
