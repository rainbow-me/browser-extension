import { useEffect, useRef } from 'react';

export default function useComponentWillUnmount(handler: () => void) {
  const willUnmount = useRef<boolean>(false);
  useEffect(() => {
    return () => {
      willUnmount.current = true;
    };
  }, []);
  useEffect(() => {
    if (willUnmount.current) {
      handler();
    }
  }, [handler]);
}
