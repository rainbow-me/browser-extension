import React from 'react';
import { chain, useAccount, useBalance } from 'wagmi';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { useCoreStore } from '~/core/state';
import { Storage } from '~/core/storage';
import { Box, Text } from '~/design-system';
import { InjectToggle } from '../../components/InjectToggle';

export function Default() {
  const { address } = useAccount();
  const [value, toggleValue] = useCoreStore((state) => [
    state.value,
    state.toggleValue,
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
        <Text size="17pt" weight="bold" color="labelSecondary">
          Value: {value ? 'TRUE' : 'FALSE'}
        </Text>
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

      <Box
        as="button"
        background="surfaceSecondary"
        onClick={() => toggleValue()}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="15pt" weight="bold">
          Toggle value
        </Text>
      </Box>
    </Box>
  );
}
