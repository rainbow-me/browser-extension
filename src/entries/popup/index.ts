import './global.css';

import { createElement } from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';

const domContainer = document.querySelector('#app');
ReactDOM.render(createElement(App), domContainer);
