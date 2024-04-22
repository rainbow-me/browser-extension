import './global.css';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { syncStores } from '~/core/state/internal/syncStores';

import { App } from './App';

require('../../core/utils/lockdown');

syncStores();

const domContainer = document.querySelector('#app') as Element;
const root = createRoot(domContainer);
root.render(createElement(App));
