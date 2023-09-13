import { useEffect } from 'react';

function debounce(func: CallableFunction, delay: number) {
  let timeId: NodeJS.Timeout | undefined;
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
  chrome.storage.session.set({ lastUnlock: Date.now() });
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
