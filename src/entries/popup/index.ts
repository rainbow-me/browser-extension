import './global.css';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { initTheming } from '~/design-system';
import { syncStores } from '~/core/state';

import { App } from './App';

initTheming();
syncStores();

const domContainer = document.querySelector('#app') as Element;
const root = createRoot(domContainer);
root.render(createElement(App));
