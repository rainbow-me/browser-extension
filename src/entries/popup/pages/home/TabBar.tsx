import * as React from 'react';
import { useAccount, useBalance } from 'wagmi';

import {
  SupportedCurrencyKey,
  supportedCurrencies,
} from '~/core/references/supportedCurrencies';
import {
  convertAmountToNativeDisplay,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';
import { Box, Inline, Inset, Text } from '~/design-system';

import { SFSymbol } from '../../components/SFSymbol/SFSymbol';
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
            symbol="tokens"
            text="Tokens"
          />
          <Tabs.Tab
            active={activeTab === 'activity'}
            onClick={() => onSelectTab('activity')}
            symbol="activity"
            text="Activity"
          />
        </Tabs>
      </Box>
      <Inset top="4px">
        {balance && (
          <Inline alignVertical="center">
            {balance?.symbol === 'ETH' && (
              <SFSymbol
                color={activeTab === 'tokens' ? 'label' : 'labelTertiary'}
                symbol="eth"
                size={14}
              />
            )}
            <Text
              color={activeTab === 'tokens' ? 'label' : 'labelTertiary'}
              size="16pt"
              weight="bold"
            >
              {displayBalance}
            </Text>
          </Inline>
        )}
      </Inset>
    </Box>
  );
}
