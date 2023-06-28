import { useEffect, useState } from 'react';

import { RainbowConfig, onConfigLoaded } from '~/core/firebase/remoteConfig';

export const useRemoteConfig = () => {
  const [remoteConfig, setRemoteConfig] = useState({} as RainbowConfig);

  useEffect(() => {
    const cleanup = onConfigLoaded((config) => setRemoteConfig(config));
    return () => {
      cleanup();
    };
  }, []);

  return { remoteConfig };
};
