import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { ChainId } from '~/core/types/chains';

import { Notification } from './notification';

export const injectNotificationIframe = ({
  chainId,
  status,
}: {
  chainId: ChainId;
  status: 'succeeded' | 'failed';
}) => {
  // in case there's one already
  document?.getElementById('rainbow-notification')?.remove();
  const notificationElement = document.createElement('div');
  notificationElement.className = 'element';
  notificationElement.id = 'rainbow-notification';
  document.body.appendChild(notificationElement);
  const domContainer = document.getElementById(
    'rainbow-notification',
  ) as Element;
  const root = createRoot(domContainer);
  root.render(createElement(Notification, { chainId, status }));

  setTimeout(() => {
    document?.getElementById('rainbow-notification')?.remove();
  }, 3000);
};
