import { createElement } from 'react';
import ReactDOM from 'react-dom';
import { Popup } from '~/pages/popup';
import '~/styles/global.css';

const domContainer = document.querySelector('#app');
ReactDOM.render(createElement(Popup), domContainer);
