import '../popup/global.css';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { Notification } from './notification';

export const injectNotificationIframe = () => {
  console.log('INHECTTTTTTTTTT ');
  const domContainer = document.getElementById('hello') as Element;

  const root = createRoot(domContainer);
  root.render(createElement(Notification));
  console.log('INHECTTTTTTTTTT RENDERINGGGG');
};
