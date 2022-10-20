import React from 'react';
import { chain, useAccount, useBalance } from 'wagmi';
import { useUserAssets } from '~/core/resources/assets';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { usePopupStore } from '~/core/state';
import { Storage } from '~/core/storage';
import { Box, Text, Inset, Stack } from '~/design-system';
import { InjectToggle } from '../../components/InjectToggle';

const HOWIE_WALLET = '0xB5447de7399e1fADBc13a1b4E14bdAD3B1c2D577';

export function Default() {
  const { address } = useAccount();
  const [
    currentAddress,
    setCurrentAddress,
    currentCurrency,
    setCurrentCurrency,
  ] = usePopupStore((state) => [
    state.currentAddress,
    state.setCurrentAddress,
    state.currentCurrency,
    state.setCurrentCurrency,
  ]);

  const { data: userAssets } = useUserAssets();
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
        <Box
          as="button"
          background="surfaceSecondary"
          onClick={Storage.clear}
          padding="16px"
          style={{ borderRadius: 999 }}
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            CLEAR STORAGE
          </Text>
        </Box>
        <Box
          as="button"
          background="surfaceSecondary"
          onClick={() => {
            if (currentAddress !== HOWIE_WALLET) {
              setCurrentAddress(HOWIE_WALLET);
            } else {
              setCurrentAddress(address || '');
            }
          }}
          padding="16px"
          style={{ borderRadius: 999 }}
        >
          <Text color="labelSecondary" size="16pt" weight="bold">
            Change Address
          </Text>
        </Box>
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
