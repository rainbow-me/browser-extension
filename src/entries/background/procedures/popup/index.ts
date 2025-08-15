import { os } from '@orpc/server';
import { RPCHandler } from '@orpc/server/message-port';

import { walletOs } from './os';
import { stateRouter } from './state';
import { walletRouter } from './wallet';

export const popupRouter = {
  wallet: walletOs.router(walletRouter),
  state: os.router(stateRouter),
};

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
