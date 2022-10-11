import React, { useCallback, useEffect, useState } from 'react';
import { useBalance } from 'wagmi';
import { Storage } from '~/core/storage';
import { Box } from '~/design-system';
import * as styles from './index.css';

export function Index() {
  const [status, setStatus] = useState(0);

  const { data: balance } = useBalance({
    addressOrName: '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4',
  });

  const switchInjection = useCallback(async () => {
    const shouldInject = (await Storage.get('inject')) === true;
    const newVal = !shouldInject;
    Storage.set('inject', newVal);
    setStatus(newVal ? 1 : 0);
  }, []);

  useEffect(() => {
    const init = async () => {
      const shouldInject = (await Storage.get('inject')) === true;
      setStatus(shouldInject ? 1 : 0);
    };
    init();
  }, []);

  return (
    <Box display="flex" flexDirection="column" gap="12px" padding="12px">
      <Box as="h1" className={styles.title}>
        Rainbow Rocks!!!
      </Box>
      <Box>Balance: {balance?.formatted}</Box>
      Injecting? <Box id="injection-status">{status ? 'YES' : 'NO'}</Box>
      <Box
        as="button"
        id="injection-button"
        onClick={switchInjection}
        className={styles.button}
      >
        TURN {status ? 'OFF' : 'ON'}
      </Box>
    </Box>
  );
}
