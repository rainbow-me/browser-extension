import { createElement } from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';
import './global.css';

const domContainer = document.querySelector('#app');
ReactDOM.render(createElement(App), domContainer);
