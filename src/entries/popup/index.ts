import './global.css';

import { createElement } from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';

const setTheme = (theme: 'dark' | 'light') => {
  document.documentElement.classList.remove('lightTheme', 'darkTheme');
  document.documentElement.classList.add(
    theme === 'dark' ? 'darkTheme' : 'lightTheme',
  );
};

const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
setTheme(darkModeMediaQuery.matches ? 'dark' : 'light');

// Update the theme if the user changes their OS preference
darkModeMediaQuery.addEventListener('change', ({ matches: isDark }) => {
  setTheme(isDark ? 'dark' : 'light');
});

// Set the initial color contexts to match their respective themes
document.body.classList.add('lightTheme-lightContext', 'darkTheme-darkContext');

const domContainer = document.querySelector('#app');
ReactDOM.render(createElement(App), domContainer);
