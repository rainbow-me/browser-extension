import { useEffect, useRef } from 'react';

export function usePoll(callback: () => void, delay: number) {
  const cbRef = useRef<() => void>();
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);
  useEffect(() => {
    function cb() {
      if (cbRef.current) {
        cbRef.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(cb, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [callback, delay]);
}
