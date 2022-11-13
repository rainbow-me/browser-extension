import './global.css';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { syncStores } from '~/core/state';
import { initThemingBody, initThemingCritical } from '~/design-system';

import { App } from './App';

initThemingCritical();
initThemingBody();
syncStores();

const domContainer = document.querySelector('#app') as Element;
const root = createRoot(domContainer);
root.render(createElement(App));
