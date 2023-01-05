import * as React from 'react';
import { useAccount, useBalance } from 'wagmi';

import {
  SupportedCurrencyKey,
  supportedCurrencies,
} from '~/core/references/supportedCurrencies';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import {
  convertAmountToNativeDisplay,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';
import { Box, Inline, Inset, Text } from '~/design-system';

import { Asterisks } from '../../components/Asterisks/Asterisks';
import { EthSymbol } from '../../components/EthSymbol/EthSymbol';
import { Tabs } from '../../components/Tabs/Tabs';

import { Tab } from '.';

export function TabBar({
  activeTab,
  onSelectTab,
}: {
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
}) {
  const { address } = useAccount();
  const { hideAssetBalances } = useHideAssetBalancesStore();
  const { data: balance } = useBalance({ addressOrName: address });
  const symbol = balance?.symbol as SupportedCurrencyKey;

  let displayBalance = symbol
    ? convertAmountToNativeDisplay(
        convertRawAmountToBalance(
          // @ts-expect-error – TODO: fix this
          balance?.value.hex || balance.value.toString(),
          supportedCurrencies[symbol],
        ).amount,
        symbol,
      )
    : '';
  if (symbol === 'ETH') {
    // Our font set doesn't seem to like the ether symbol, so we have to omit it and use
    // an icon instead.
    displayBalance = displayBalance.replace('Ξ', '');
  }

  const displayBalanceComponent = hideAssetBalances ? (
    <Inline alignHorizontal="right">
      <Asterisks color="label" size={13} />
    </Inline>
  ) : (
    <Text
      color={activeTab === 'tokens' ? 'label' : 'labelTertiary'}
      size="16pt"
      weight="bold"
    >
      {displayBalance}
    </Text>
  );

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      paddingHorizontal="20px"
      width="full"
      style={{ height: 34 }}
    >
      <Box>
        <Tabs>
          <Tabs.Tab
            active={activeTab === 'tokens'}
            onClick={() => onSelectTab('tokens')}
            symbol="record.circle.fill"
            text="Tokens"
          />
          <Tabs.Tab
            active={activeTab === 'activity'}
            onClick={() => onSelectTab('activity')}
            symbol="bolt.fill"
            text="Activity"
          />
        </Tabs>
      </Box>
      <Inset top="4px">
        {balance && (
          <Inline alignVertical="center">
            {balance?.symbol === 'ETH' && (
              <EthSymbol
                color={activeTab === 'tokens' ? 'label' : 'labelTertiary'}
                size={14}
              />
            )}
            {displayBalanceComponent}
          </Inline>
        )}
      </Inset>
    </Box>
  );
}
