import { useEffect, useRef } from 'react';

export default function useComponentWillUnmount(handler: VoidFunction) {
  const cb = useRef(handler);
  cb.current = handler;
  useEffect(() => {
    return () => {
      cb.current();
    };
  }, []);
}
