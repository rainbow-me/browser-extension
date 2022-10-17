import React, { useCallback, useEffect, useState } from 'react';
import { chain, useAccount, useBalance } from 'wagmi';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { Storage } from '~/core/storage';
import { Box, Text } from '~/design-system';

export function Default() {
  const [status, setStatus] = useState(0);

  const { address } = useAccount();
  const { data: mainnetBalance } = useBalance({
    addressOrName: address,
    chainId: chain.mainnet.id,
  });
  const { data: polygonBalance } = useBalance({
    addressOrName: address,
    chainId: chain.polygon.id,
  });
  const { data: firstTransactionTimestamp } = useFirstTransactionTimestamp({
    address,
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
          Mainnet Balance: {mainnetBalance?.formatted}
        </Text>
        <Text size="17pt" weight="bold" color="labelSecondary">
          Polygon Balance: {polygonBalance?.formatted}
        </Text>
        {firstTransactionTimestamp && (
          <Text size="17pt" weight="bold" color="labelTertiary">
            First transaction on:{' '}
            {new Date(firstTransactionTimestamp).toString()}
          </Text>
        )}
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
      <Box
        as="button"
        background="surfaceSecondary"
        onClick={Storage.clear}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="15pt" weight="bold">
          CLEAR STORAGE
        </Text>
      </Box>
    </Box>
  );
}
