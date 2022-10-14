import React, { useCallback, useEffect, useState } from 'react';
import { useBalance } from 'wagmi';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { Storage } from '~/core/storage';
import { AccentColorProvider, ThemeProvider, Box, Text } from '~/design-system';

export function Index() {
  const [status, setStatus] = useState(0);

  const { data: balance } = useBalance({
    addressOrName: '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4',
  });
  const { data: firstTransactionTimestamp } = useFirstTransactionTimestamp({
    address: '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4',
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
    <Box display="flex" flexDirection="column" gap="24px" padding="20px">
      <Text as="h1" size="20pt" weight="bold">
        Rainbow Rocks!!!
      </Text>
      <Box display="flex" flexDirection="column" gap="16px">
        <Text size="17pt" weight="bold" color="labelSecondary">
          Balance: {balance?.formatted}
        </Text>
        {firstTransactionTimestamp && (
          <Text size="17pt" weight="bold" color="labelTertiary">
            First transaction on:{' '}
            {new Date(firstTransactionTimestamp).toString()}
          </Text>
        )}
      </Box>
      <Box display="flex" flexDirection="column" gap="16px">
        <Box background="accent" padding="12px" style={{ borderRadius: 999 }}>
          <Text size="17pt" weight="bold" align="center">
            Default accent background
          </Text>
        </Box>
        <Text size="17pt" weight="bold" color="accent" align="center">
          Default accent foreground
        </Text>
      </Box>
      <AccentColorProvider color="#FFB266">
        <Box display="flex" flexDirection="column" gap="16px">
          <Box background="accent" padding="12px" style={{ borderRadius: 999 }}>
            <Text size="17pt" weight="bold" align="center">
              Custom accent background
            </Text>
          </Box>
          <Text size="17pt" weight="bold" color="accent" align="center">
            Custom accent foreground
          </Text>
        </Box>
      </AccentColorProvider>
      <Box display="flex" flexDirection="column" gap="16px">
        <ThemeProvider theme="dark">
          <Box padding="12px" background="surfacePrimary">
            <Text size="17pt" weight="bold" color="label" align="center">
              Dark theme via ThemeProvider
            </Text>
          </Box>
        </ThemeProvider>
        <ThemeProvider theme="light">
          <Box padding="12px" background="surfacePrimary">
            <Text size="17pt" weight="bold" color="label" align="center">
              Light theme via ThemeProvider
            </Text>
          </Box>
        </ThemeProvider>
      </Box>
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
        background="surfaceSecondary"
        onClick={switchInjection}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="15pt" weight="bold">
          TURN {status ? 'OFF' : 'ON'}
        </Text>
      </Box>
    </Box>
  );
}
