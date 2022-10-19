import { coreStore } from '~/core/state';
import { coreStoreTransport } from '~/core/transports';

/**
 * Handles coreStore state changes
 */
export const handleCoreStoreChange = () =>
  coreStore.subscribe((state) => {
    coreStoreTransport.send(state);
  });
