import { useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';

import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { Box, Inline, Inset, Text } from '~/design-system';

import { skeletonLine } from '../../components/ActivitySkeleton/ActivitySkeleton.css';
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
  const { data: balance, isLoading } = useBalance({ address });
  const { display: userAssetsBalanceDisplay } = useUserAssetsBalance();
  const { currentCurrency } = useCurrentCurrencyStore();

  const displayBalanceComponent = useMemo(
    () =>
      hideAssetBalances ? (
        <Inline alignHorizontal="right" alignVertical="center">
          <Text
            testId={'balance-hidden'}
            color={activeTab === 'tokens' ? 'label' : 'labelTertiary'}
            size="16pt"
            weight="bold"
          >
            {supportedCurrencies?.[currentCurrency]?.symbol}
          </Text>
          <Asterisks color="label" size={13} />
        </Inline>
      ) : (
        <Text
          testId={'balance-shown'}
          color={activeTab === 'tokens' ? 'label' : 'labelTertiary'}
          size="16pt"
          weight="bold"
          userSelect="all"
          cursor="text"
        >
          {userAssetsBalanceDisplay}
        </Text>
      ),
    [activeTab, currentCurrency, hideAssetBalances, userAssetsBalanceDisplay],
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
        {isLoading && (
          <Inline alignVertical="center">
            <Box
              className={skeletonLine}
              background="fillHorizontal"
              style={{ width: '62px', height: '11px' }}
            ></Box>
          </Inline>
        )}

        {balance && (
          <Inline alignVertical="center">{displayBalanceComponent}</Inline>
        )}
      </Inset>
    </Box>
  );
}
