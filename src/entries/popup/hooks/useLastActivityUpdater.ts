import debounce from 'lodash/debounce';
import { useEffect, useMemo } from 'react';

import { useLastActivityStore } from '~/core/state/lastActivity';

/**
 * Hook that tracks user activity (mouse/keyboard) and updates lastActivity timestamp
 * This is used by the autolock system to determine when the user was last active
 */
export const useLastActivityUpdater = () => {
  const recordActivity = useLastActivityStore((state) => state.recordActivity);

  const debouncedRecordActivity = useMemo(() => {
    return debounce(() => {
      recordActivity();
    }, 1000);
  }, [recordActivity]);

  useEffect(() => {
    // Record activity on initial load
    debouncedRecordActivity();
    // listen for mouse and keyboard events
    window.addEventListener('mousemove', debouncedRecordActivity);
    window.addEventListener('keydown', debouncedRecordActivity);

    // cleanup
    return () => {
      window.removeEventListener('mousemove', debouncedRecordActivity);
      window.removeEventListener('keydown', debouncedRecordActivity);
    };
  }, [debouncedRecordActivity]);
};
