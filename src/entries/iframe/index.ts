import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { Notification } from './notification';

export const injectNotificationIframe = () => {
  const domContainer = document.getElementById(
    'rainbow-notification',
  ) as Element;

  const root = createRoot(domContainer);
  root.render(createElement(Notification));
};
