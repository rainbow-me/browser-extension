import { os } from '@orpc/server';
import { RPCHandler } from '@orpc/server/message-port';
import * as Sentry from '@sentry/react';

import { INTERNAL_BUILD, IS_TESTING } from '~/core/sentry';
import { RainbowError, logger } from '~/logger';

import { POPUP_PORT_NAME } from './constants';
import { healthRouter } from './health';
import { walletOs } from './os';
import { stateRouter } from './state';
import { telemetryRouter } from './telemetry';
import { walletRouter } from './wallet';

const sentryMiddleware = os.middleware(async ({ next, path }) => {
  if (INTERNAL_BUILD || IS_TESTING) {
    Sentry.addBreadcrumb({
      message: `ORPC: ${path.join('/')}`,
      data: {
        path: path.join('/'),
        timestamp: new Date().toISOString(),
      },
    });
  }
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
  telemetry: os.use(sentryMiddleware).router(telemetryRouter),
};

export type PopupRouter = typeof popupRouter;

export function startPopupRouter() {
  const handler = new RPCHandler(popupRouter);

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === POPUP_PORT_NAME) {
      handler.upgrade(port, {
        context: {
          sender: port.sender,
        },
      });
    }
  });
}
