import { os } from '@orpc/server';
import { RPCHandler } from '@orpc/server/message-port';
import * as Sentry from '@sentry/react';

import { walletOs } from './os';
import { stateRouter } from './state';
import { walletRouter } from './wallet';

const sentryMiddleware = os.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
});

export const popupRouter = {
  wallet: walletOs.use(sentryMiddleware).router(walletRouter),
  state: os.use(sentryMiddleware).router(stateRouter),
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
