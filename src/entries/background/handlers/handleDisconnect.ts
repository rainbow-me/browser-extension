import { SessionStorage } from '~/core/storage';

import { onPopupDisconnect } from './popupDisconnect';

const POPUP_INSTANCE_DATA_EXPIRY = 180000;
export function handleDisconnect() {
  onPopupDisconnect(async () => {
    await SessionStorage.set('expiry', Date.now() + POPUP_INSTANCE_DATA_EXPIRY);
  });
}
