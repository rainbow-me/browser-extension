import './global.css';

import { createElement } from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';

const darkMode = '(prefers-color-scheme: dark)';

const setRootTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('darkTheme');
    document.documentElement.classList.remove('lightTheme');
  } else {
    document.documentElement.classList.add('lightTheme');
    document.documentElement.classList.remove('darkTheme');
  }
};

setRootTheme(window.matchMedia(darkMode).matches);

window
  .matchMedia(darkMode)
  .addEventListener('change', ({ matches }) => setRootTheme(matches));

const domContainer = document.querySelector('#app');
ReactDOM.render(createElement(App), domContainer);
