import { useEffect, useState } from 'react';

import config, { RainbowConfig } from '~/core/firebase/remoteConfig';

export const useRemoteConfig = () => {
  const [remoteConfig, setRemoteConfig] = useState<RainbowConfig>(
    {} as RainbowConfig,
  );
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setRemoteConfig(config);
      setReady(true);
    }, 500);
  }, []);

  return { remoteConfig, remoteConfigReady: ready };
};
