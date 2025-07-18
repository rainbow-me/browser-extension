import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { initializeSentry } from '~/core/sentry';
import { ChainId } from '~/core/types/chains';

import { IN_DAPP_NOTIFICATION_STATUS, Notification } from './notification';

const ELEMENT_ID = 'rainbow-notification';

const NOTIFICATION_DURATION = 3000;
const DELAY_DURATION = 2000;

initializeSentry('iframe');

export const injectNotificationIframe = async ({
  chainId,
  chainName,
  status,
  extensionUrl,
}: {
  chainId: ChainId;
  chainName?: string;
  status: IN_DAPP_NOTIFICATION_STATUS;
  extensionUrl: string;
}) => {
  // in case there's one already
  const notificationAlreadyInjected = !!document?.getElementById(ELEMENT_ID);
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) =>
    // eslint-disable-next-line no-promise-executor-return
    setTimeout(resolve, notificationAlreadyInjected ? DELAY_DURATION : 0),
  );
  const notificationElement = document.createElement('div');
  notificationElement.className = 'element';
  notificationElement.id = ELEMENT_ID;
  document.body.appendChild(notificationElement);
  const domContainer = document.getElementById(ELEMENT_ID) as Element;
  const root = createRoot(domContainer);
  root.render(
    createElement(Notification, { chainId, chainName, status, extensionUrl }),
  );

  setTimeout(() => {
    document?.getElementById(ELEMENT_ID)?.remove();
  }, NOTIFICATION_DURATION);
};
