import { useEffect, useState } from 'react';

export function useIsWindows() {
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    setIsWindows(navigator.userAgent.indexOf('Win') !== -1);
  }, []);

  return isWindows;
}
