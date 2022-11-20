import React, { useState } from 'react';
import { Address, chain, useAccount, useBalance } from 'wagmi';

import { ETH_ADDRESS } from '~/core/references';
import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useAssetPrices, useUserAssets } from '~/core/resources/assets';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { useTransactions } from '~/core/resources/transactions/transactions';
import { useCurrentCurrencyStore, useCurrentLanguageStore } from '~/core/state';
import { RainbowTransaction } from '~/core/types/transactions';
import { Box, Inset, Stack, Text } from '~/design-system';

import { i18n } from '../../../../core/languages';
import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '../../components/Menu/Menu';
import { ClearStorage } from '../../components/_dev/ClearStorage';

export function Default() {
  const { address } = useAccount();
  const { currentCurrency, setCurrentCurrency } = useCurrentCurrencyStore();
  const { currentLanguage } = useCurrentLanguageStore();
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');

  const { data: userAssets } = useUserAssets(
    {
      address,
      currency: currentCurrency,
    },
    { select: selectUserAssetsList },
  );
  const { data: assetPrices } = useAssetPrices({
    assetAddresses: userAssets
      ?.map((asset) => asset?.address)
      .concat(ETH_ADDRESS as Address),
    currency: currentCurrency,
  });
  const { data: transactions } = useTransactions({
    address,
    currency: currentCurrency,
  });
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
          <Text color="labelSecondary" size="16pt" weight="bold">
            LANGUAGE (from state): {currentLanguage}
          </Text>
          <Text color="labelSecondary" size="16pt" weight="bold">
            LANGUAGE SALUTE (from i18n): {i18n.t('test.salute')}
          </Text>
        </Stack>
        <Menu>
          <MenuTrigger asChild>
            <Box
              as="button"
              background="surfaceSecondary"
              padding="16px"
              style={{ borderRadius: 999 }}
            >
              <Text color="labelSecondary" size="14pt" weight="bold">
                Menu
              </Text>
            </Box>
          </MenuTrigger>

          <MenuContent>
            <MenuSeparator />
            <MenuLabel>Networks</MenuLabel>
            <MenuRadioGroup
              value={selectedNetwork}
              onValueChange={setSelectedNetwork}
            >
              <MenuRadioItem value="ethereum">
                <Text color="label" size="14pt" weight="bold">
                  Ethereum
                </Text>
                <MenuItemIndicator style={{ marginLeft: 'auto' }}>
                  <Text color="labelSecondary" size="11pt" weight="bold">
                    Selected
                  </Text>
                </MenuItemIndicator>
              </MenuRadioItem>
              <MenuRadioItem value="optimism">
                <Text color="label" size="14pt" weight="bold">
                  Optimism
                </Text>
                <MenuItemIndicator style={{ marginLeft: 'auto' }}>
                  <Text color="labelSecondary" size="11pt" weight="bold">
                    Selected
                  </Text>
                </MenuItemIndicator>
              </MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
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
        {userAssets
          ?.filter((asset) => asset?.price?.value)
          .map((asset, i) => (
            <Text
              color="labelSecondary"
              size="16pt"
              weight="medium"
              key={`${asset?.address}${i}`}
            >
              {`NAME: ${asset?.name} CHAIN: ${asset?.chainName} NATIVE BALANCE: ${asset?.native?.balance?.display}`}
            </Text>
          ))}
        <Text color="label" size="20pt" weight="bold">
          Transactions:
        </Text>
        {transactions?.map((tx: RainbowTransaction) => {
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
        <Text color="label" size="20pt" weight="bold">
          Prices:
        </Text>
        {Object.values(assetPrices || {}).map((price, i) => {
          return (
            <Text
              color="labelSecondary"
              size="16pt"
              weight="medium"
              key={`prices-${i}`}
            >
              {`${price?.price?.display}: ${price?.change}`}
            </Text>
          );
        })}
      </Stack>
    </Inset>
  );
}
