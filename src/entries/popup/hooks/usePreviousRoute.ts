import { useLayoutEffect, useRef } from 'react';

import { usePreviousRouteStore } from '~/core/state/previousRoute';
import { AnimatedAttributes } from '~/design-system/styles/designTokens';

export function usePreviousRoute(exit: AnimatedAttributes) {
  const { previousExit, setPreviousExit } = usePreviousRouteStore();
  const currentExitRef = useRef(exit);

  useLayoutEffect(() => {
    return () => {
      setPreviousExit(currentExitRef.current);
    };
  }, [setPreviousExit]);

  currentExitRef.current = exit;

  return { previousExit };
}
