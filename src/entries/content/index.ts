import { initializeMessenger } from '~/core/messengers';
import { setupBridgeMessengerRelay } from '~/core/messengers/internal/bridge';
import { isDefaultWalletStore } from '~/core/state/currentSettings/isDefaultWallet';
require('../../core/utils/lockdown');

setupBridgeMessengerRelay();

const inpageMessenger = initializeMessenger({ connect: 'inpage' });

setTimeout(() => {
  inpageMessenger.send('rainbow_setDefaultProvider', {
    rainbowAsDefault: isDefaultWalletStore.getState().isDefaultWallet,
  });
}, 1);
