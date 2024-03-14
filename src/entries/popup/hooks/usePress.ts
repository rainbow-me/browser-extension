import { useCallback, useRef, useState } from 'react';

export const usePress = (onPressed: () => void) => {
  const pressTimerRef = useRef<NodeJS.Timeout>();
  const [pressed, setPressed] = useState(false);

  const startPress = useCallback(() => {
    setPressed(false);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => {
      onPressed();
      setPressed(true);
    }, 500);
  }, [onPressed]);

  const endPress = useCallback(() => {
    if (pressed) setPressed(false);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
  }, [pressed]);

  return { pressed, startPress, endPress };
};
