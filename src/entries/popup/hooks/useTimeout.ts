import { useEffect, useLayoutEffect, useRef } from 'react';

export function useTimeoutEffect(
  onTimeout: (e: { cancelled: boolean; elapsedTime: number }) => void,
  { timeout, enabled = true }: { timeout: number; enabled?: boolean },
) {
  const callback = useRef(onTimeout);
  useLayoutEffect(() => {
    callback.current = onTimeout;
  }, [onTimeout]);

  const timeoutRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (!enabled) return;
    const startedAt = Date.now();
    timeoutRef.current = setTimeout(() => {
      callback.current({
        cancelled: false,
        elapsedTime: Date.now() - startedAt,
      });
    }, timeout);
    return () => {
      if (!timeoutRef.current) return;
      clearTimeout(timeoutRef.current);
      const elapsedTime = Date.now() - startedAt;
      if (elapsedTime < timeout) {
        callback.current({ cancelled: true, elapsedTime });
      }
    };
  }, [timeout, enabled]);
}
