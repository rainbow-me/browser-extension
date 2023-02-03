import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { ChainId } from '~/core/types/chains';

import { Notification } from './notification';

const ELEMENT_ID = 'rainbow-notification';

const NOTIFICATION_DURATION = 3000;

export const injectNotificationIframe = async ({
  chainId,
  status,
  extensionUrl,
}: {
  chainId: ChainId;
  status: 'success' | 'failed';
  extensionUrl: string;
}) => {
  // in case there's one already
  const notificationAlreadyInjected = !!document?.getElementById(ELEMENT_ID);
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve) =>
    // eslint-disable-next-line no-promise-executor-return
    setTimeout(
      resolve,
      notificationAlreadyInjected ? NOTIFICATION_DURATION : 0,
    ),
  );
  const notificationElement = document.createElement('div');
  notificationElement.className = 'element';
  notificationElement.id = ELEMENT_ID;
  document.body.appendChild(notificationElement);
  const domContainer = document.getElementById(ELEMENT_ID) as Element;
  const root = createRoot(domContainer);
  root.render(createElement(Notification, { chainId, status, extensionUrl }));

  setTimeout(() => {
    document?.getElementById(ELEMENT_ID)?.remove();
  }, 3000);
};
