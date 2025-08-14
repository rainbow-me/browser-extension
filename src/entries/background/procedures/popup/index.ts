import { RPCHandler } from '@orpc/server/message-port';

import { popupOs } from './os';
import { stateRouter } from './state';
import { walletRouter } from './wallet';

export const popupRouter = popupOs.router({
  wallet: walletRouter,
  state: stateRouter,
});

export type PopupRouter = typeof popupRouter;

export function startPopupRouter() {
  const handler = new RPCHandler(popupRouter);

  chrome.runtime.onConnect.addListener((port) => {
    handler.upgrade(port, {
      context: {
        sender: port.sender,
      },
    });
  });
}
