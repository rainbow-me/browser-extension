import React from 'react';
import { chain, useAccount, useBalance } from 'wagmi';
import { useUserAssets } from '~/core/resources/assets';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { usePopupStore } from '~/core/state';
import { Text, Inset, Stack, Box } from '~/design-system';
import { ClearStorage } from '../../components/_dev/ClearStorage';
import { InjectToggle } from '../../components/_dev/InjectToggle';

export function Default() {
  const { address } = useAccount();
  const [currentCurrency, setCurrentCurrency] = usePopupStore((state) => [
    state.currentCurrency,
    state.setCurrentCurrency,
  ]);

  const { data: userAssets, ...rest } = useUserAssets();
  console.log('test', userAssets, rest);
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
    <Inset space="20px">
      <Stack space="24px">
        <Text as="h1" size="20pt" weight="bold">
          Rainbow Rocks!!!
        </Text>
        <Stack space="16px">
          <Text size="14pt" weight="bold" color="labelSecondary">
            Mainnet Balance: {mainnetBalance?.formatted}
          </Text>
          <Text size="14pt" weight="bold" color="labelSecondary">
            Polygon Balance: {polygonBalance?.formatted}
          </Text>
          {firstTransactionTimestamp && (
            <Text size="14pt" weight="bold" color="labelTertiary">
              First transaction on:{' '}
              {new Date(firstTransactionTimestamp).toString()}
            </Text>
          )}
        </Stack>
        <InjectToggle />
        <ClearStorage />
        <Box
          as="button"
          background="surfaceSecondary"
          onClick={() => {
            const newCurrency = currentCurrency === 'usd' ? 'gbp' : 'usd';
            setCurrentCurrency(newCurrency);
          }}
          padding="16px"
          style={{ borderRadius: 999 }}
        >
          <Text color="labelSecondary" size="16pt" weight="bold">
            {`CURRENT CURRENCY: ${currentCurrency?.toUpperCase()} | CHANGE`}
          </Text>
        </Box>
        {Object.values(userAssets || {}).map((item, i) => (
          <Text
            color="labelSecondary"
            size="16pt"
            weight="bold"
            key={`${item?.asset?.address}${i}`}
          >
            {`${item?.asset?.name}: ${item?.asset?.price?.value}`}
          </Text>
        ))}
      </Stack>
    </Inset>
  );
}
