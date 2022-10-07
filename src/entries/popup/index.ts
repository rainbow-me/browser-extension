import './global.css';

import { createElement } from 'react';
import ReactDOM from 'react-dom';

import { Index } from './pages';

const domContainer = document.querySelector('#app');
ReactDOM.render(createElement(Index), domContainer);
