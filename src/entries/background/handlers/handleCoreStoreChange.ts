import { useCoreStore } from '~/core/state';
import { coreStoreTransport } from '~/core/transports';

/**
 * Handles coreStore state changes
 */
export const handleCoreStoreChange = () =>
  coreStoreTransport.reply(async (state, meta) => {
    console.log(state, 'coreStore state from handler');
    console.log(useCoreStore.getState());
  });
