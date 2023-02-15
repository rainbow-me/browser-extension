import * as React from 'react';
import { useAccount, useBalance } from 'wagmi';

import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { Box, Inline, Inset, Text } from '~/design-system';

import { Asterisks } from '../../components/Asterisks/Asterisks';
import { Tabs } from '../../components/Tabs/Tabs';
import { useUserAssetsBalance } from '../../hooks/useUserAssetsBalance';
import { tabIndexes } from '../../utils/tabIndexes';

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
  const { display: userAssetsBalanceDisplay } = useUserAssetsBalance();

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
      {userAssetsBalanceDisplay}
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
            tabIndex={tabIndexes.WALLET_HEADER_TOKENS_TAB}
          />
          <Tabs.Tab
            active={activeTab === 'activity'}
            onClick={() => onSelectTab('activity')}
            symbol="bolt.fill"
            text="Activity"
            tabIndex={tabIndexes.WALLET_HEADER_ACTIVITY_TAB}
          />
        </Tabs>
      </Box>
      <Inset top="4px">
        {balance && (
          <Inline alignVertical="center">{displayBalanceComponent}</Inline>
        )}
      </Inset>
    </Box>
  );
}
