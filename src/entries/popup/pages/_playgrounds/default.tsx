import { useState } from 'react';
import { useBalance } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useUserAssets } from '~/core/resources/assets';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { useTransactions } from '~/core/resources/transactions/transactions';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  useCurrentLanguageStore,
} from '~/core/state';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { Box, Inset, Stack, Text } from '~/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';

import { i18n } from '../../../../core/languages';
import { ClearStorage } from '../../components/_dev/ClearStorage';

export function Default() {
  const { currentAddress: address } = useCurrentAddressStore();
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
  const { data: transactions } = useTransactions({
    address,
    chainId: ChainId.mainnet,
    currency: currentCurrency,
  });
  const { data: mainnetBalance } = useBalance({
    address,
    chainId: ChainId.mainnet,
  });
  const { data: polygonBalance } = useBalance({
    address,
    chainId: ChainId.polygon,
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Box
              as="button"
              background="surfaceSecondary"
              padding="16px"
              style={{ borderRadius: 999 }}
            >
              <Text color="labelSecondary" size="14pt" weight="bold">
                Dropdown Menu
              </Text>
            </Box>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Networks</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={selectedNetwork}
              onValueChange={setSelectedNetwork}
            >
              <DropdownMenuRadioItem value="ethereum">
                <Text color="label" size="14pt" weight="bold">
                  Ethereum
                </Text>
                <DropdownMenuItemIndicator style={{ marginLeft: 'auto' }}>
                  <Text color="labelSecondary" size="11pt" weight="bold">
                    Selected
                  </Text>
                </DropdownMenuItemIndicator>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="optimism">
                <Text color="label" size="14pt" weight="bold">
                  Optimism
                </Text>
                <DropdownMenuItemIndicator style={{ marginLeft: 'auto' }}>
                  <Text color="labelSecondary" size="11pt" weight="bold">
                    Selected
                  </Text>
                </DropdownMenuItemIndicator>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
            {`CURRENT CURRENCY: ${currentCurrency} | CHANGE`}
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
              {`${tx?.title} ${tx?.description}: ${tx.native?.value}`}
            </Text>
          );
        })}
      </Stack>
    </Inset>
  );
}
