import './global.css';

import { createElement } from 'react';
import ReactDOM from 'react-dom';

import { initTheming } from '~/design-system';
import { App } from './App';

initTheming();

const domContainer = document.querySelector('#app');
ReactDOM.render(createElement(App), domContainer);
