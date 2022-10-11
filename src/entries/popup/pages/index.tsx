import React, { useCallback, useEffect, useState } from 'react';
import { Storage } from '~/core/storage';
import { Box, Text } from '~/design-system';
import * as styles from './index.css';

export function Index() {
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
    <Box display="flex" flexDirection="column" gap="12px" padding="12px">
      <Text as="h1" size="26pt" weight="bold">
        Rainbow Rocks!!!
      </Text>
      <Text size="17pt" weight="bold" color="labelSecondary">
        Injecting?{' '}
        <Box as="span" id="injection-status">
          {status ? 'YES' : 'NO'}
        </Box>
      </Text>
      <Box
        background="surfaceSecondary"
        display="flex"
        flexDirection="column"
        gap="12px"
        padding="12px"
      >
        <Text size="17pt" weight="bold">
          Surface Secondary
        </Text>
        <Box background="surfaceSecondaryElevated" padding="12px">
          <Text size="17pt" weight="bold">
            Surface Secondary Elevated
          </Text>
        </Box>
        <Box background="fill" padding="12px">
          <Text size="17pt" weight="bold">
            Fill
          </Text>
        </Box>
      </Box>
      <Box
        background="yellow"
        display="flex"
        flexDirection="column"
        gap="12px"
        padding="12px"
      >
        <Text size="17pt" weight="bold">
          Yellow
        </Text>
        <Box background="fill" padding="12px">
          <Text size="17pt" weight="bold">
            Fill
          </Text>
        </Box>
      </Box>
      <Box
        as="button"
        id="injection-button"
        background="surfaceSecondary"
        onClick={switchInjection}
        className={styles.button}
      >
        <Text color="labelSecondary" size="17pt" weight="bold">
          TURN {status ? 'OFF' : 'ON'}
        </Text>
      </Box>
    </Box>
  );
}
