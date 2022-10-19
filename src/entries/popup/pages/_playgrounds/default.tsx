import React from 'react';
import { chain, useAccount, useBalance } from 'wagmi';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { usePopupStore } from '~/core/state';
import { Storage } from '~/core/storage';
import { Box, Text } from '~/design-system';
import { InjectToggle } from '../../components/InjectToggle';

export function Default() {
  const { address } = useAccount();

  const [currentAddress, setCurrentAddress] = usePopupStore((state) => [
    state.currentAddress,
    state.setCurrentAddress,
  ]);

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
      <InjectToggle />
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
