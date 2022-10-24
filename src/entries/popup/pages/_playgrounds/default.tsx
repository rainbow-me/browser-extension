import React from 'react';
import { chain, useAccount, useBalance } from 'wagmi';
import { useUserAssets } from '~/core/resources/assets';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { useCurrentCurrencyStore } from '~/core/state/currentCurrency';
import { useTransactions } from '~/core/resources/transactions/transactions';
import { Text, Inset, Stack, Box } from '~/design-system';
import { ClearStorage } from '../../components/_dev/ClearStorage';
import { InjectToggle } from '../../components/_dev/InjectToggle';

export function Default() {
  const { address } = useAccount();
  const { currentCurrency, setCurrentCurrency } = useCurrentCurrencyStore();

  const { data: userAssets } = useUserAssets();
  const { data: transactions } = useTransactions();
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
            const newCurrency = currentCurrency !== 'USD' ? 'USD' : 'GBP';
            setCurrentCurrency(newCurrency);
          }}
          padding="16px"
          style={{ borderRadius: 999 }}
        >
          <Text color="labelSecondary" size="16pt" weight="bold">
            {`CURRENT CURRENCY: ${currentCurrency?.toUpperCase()} | CHANGE`}
          </Text>
        </Box>
        <Text color="label" size="20pt" weight="bold">
          Assets:
        </Text>
        {Object.values(userAssets || {})
          .filter((item) => item?.asset?.price?.value)
          .map((item, i) => (
            <Text
              color="labelSecondary"
              size="16pt"
              weight="medium"
              key={`${item?.asset?.address}${i}`}
            >
              {`${item?.asset?.name}: ${item?.asset?.price?.value}`}
            </Text>
          ))}
        <Text color="label" size="20pt" weight="bold">
          Transactions:
        </Text>
        {transactions?.map((tx) => {
          return (
            <Text
              color="labelSecondary"
              size="16pt"
              weight="medium"
              key={tx?.hash}
            >
              {`${tx?.title} ${tx?.name}: ${tx.native?.display}`}
            </Text>
          );
        })}
      </Stack>
    </Inset>
  );
}
