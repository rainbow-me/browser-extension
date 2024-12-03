import { useEffect, useLayoutEffect, useRef } from 'react';

export function useTimeoutEffect(
  onTimeout: (e: { cancelled: boolean; elapsedTime: number }) => void,
  delay: number,
) {
  const callback = useRef(onTimeout);
  useLayoutEffect(() => {
    callback.current = onTimeout;
  }, [onTimeout]);

  const timeoutRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    const startedAt = Date.now();
    timeoutRef.current = setTimeout(
      () =>
        callback.current({
          cancelled: false,
          elapsedTime: Date.now() - startedAt,
        }),
      delay,
    );
    const timeout = timeoutRef.current;
    return () => {
      clearTimeout(timeout);
      const elapsedTime = Date.now() - startedAt;
      if (elapsedTime < delay) {
        callback.current({ cancelled: true, elapsedTime });
      }
    };
  }, [delay]);
}
