import { useEffect } from 'react';

import { SessionStorage } from '~/core/storage';

function debounce(func: CallableFunction, delay: number) {
  let timeId: Timer | undefined;
  return function (...args: unknown[]) {
    if (timeId) {
      clearTimeout(timeId);
    }
    timeId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const recordActivity = debounce(() => {
  SessionStorage.set('lastUnlock', new Date().toJSON());
}, 1000);

export const IdleTimer = () => {
  useEffect(() => {
    // Set activity on initial load
    recordActivity();
    // listen for mouse and keyboard events
    window.addEventListener('mousemove', recordActivity);
    window.addEventListener('keydown', recordActivity);

    // cleanup
    return () => {
      window.removeEventListener('mousemove', recordActivity);
      window.removeEventListener('keydown', recordActivity);
    };
  }, []);
  return null;
};
