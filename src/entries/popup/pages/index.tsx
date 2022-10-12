import React, { useCallback, useEffect, useState } from 'react';
import { useBalance } from 'wagmi';
import { Storage } from '~/core/storage';
import { Box, Text } from '~/design-system';

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
      <Text as="h1" size="26pt" weight="bold">
        Rainbow Rocks!!!
      </Text>
      <Text size="17pt" weight="bold" color="labelSecondary">
        Balance: {balance?.formatted}
      </Text>
      <Text size="17pt" weight="bold" color="labelSecondary">
        Injecting?{' '}
        <Box as="span" testId="injection-status">
          {status ? 'YES' : 'NO'}
        </Box>
      </Text>
      <Box
        as="button"
        id="injection-button"
        background="surfaceSecondary"
        onClick={switchInjection}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="17pt" weight="bold">
          TURN {status ? 'OFF' : 'ON'}
        </Text>
      </Box>
    </Box>
  );
}
