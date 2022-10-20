import React, { useCallback, useEffect, useState } from 'react';
import { Storage } from '~/core/storage';
import { Box, Text } from '~/design-system';

export function InjectToggle() {
  const [status, setStatus] = useState(0);

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
    <>
      <Box display="flex" flexDirection="row" gap="8px">
        <Text size="17pt" weight="bold" color="labelTertiary">
          Injecting?
        </Text>
        <Text
          size="17pt"
          weight="bold"
          color={status ? 'green' : 'red'}
          testId="injection-status"
        >
          {status ? 'YES' : 'NO'}
        </Text>
      </Box>
      <Box
        as="button"
        id="injection-button"
        background="accent"
        onClick={switchInjection}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="15pt" weight="bold">
          TURN {status ? 'OFF' : 'ON'}
        </Text>
      </Box>
    </>
  );
}
