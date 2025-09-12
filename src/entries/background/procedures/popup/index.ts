import { os } from '@orpc/server';
import { RPCHandler } from '@orpc/server/message-port';

import { RainbowError, logger } from '~/logger';

import { healthRouter } from './health';
import { walletOs } from './os';
import { stateRouter } from './state';
import { walletRouter } from './wallet';

const sentryMiddleware = os.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (e) {
    logger.error(new RainbowError((e as Error)?.message, { cause: e }));
    throw e;
  }
});

export const popupRouter = {
  wallet: walletOs.use(sentryMiddleware).router(walletRouter),
  state: os.use(sentryMiddleware).router(stateRouter),
  health: os.use(sentryMiddleware).router(healthRouter),
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
