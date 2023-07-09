import { useEffect } from 'react';

export default function useScrollLock(shouldLock: boolean) {
  useEffect(() => {
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.dataset.originalOverflow = originalOverflow;

    if (shouldLock) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'absolute';
    } else {
      const originalOverflow = document.body.dataset.originalOverflow;
      document.body.style.overflow = originalOverflow
        ? originalOverflow
        : 'auto';
      document.body.style.position = '';
    }

    return () => {
      const originalOverflow = document.body.dataset.originalOverflow;
      document.body.style.overflow = originalOverflow
        ? originalOverflow
        : 'auto';
      document.body.style.position = '';
    };
  }, [shouldLock]);
}
