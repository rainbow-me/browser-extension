import { createElement } from 'react';
import ReactDOM from 'react-dom';

import { Index } from './pages';
import './global.css';

const domContainer = document.querySelector('#app');
ReactDOM.render(createElement(Index), domContainer);
