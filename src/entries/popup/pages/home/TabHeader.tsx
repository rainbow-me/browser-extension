import { useMemo } from 'react';
import { useBalance } from 'wagmi';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { getNftCount } from '~/core/resources/nfts/nfts';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { Box, Inline, Inset, Text } from '~/design-system';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';

import { Asterisks } from '../../components/Asterisks/Asterisks';
import { Tab } from '../../components/Tabs/TabBar';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { useUserAssetsBalance } from '../../hooks/useUserAssetsBalance';
import { useVisibleTokenCount } from '../../hooks/useVisibleTokenCount';

import DisplayModeDropdown from './NFTs/DisplayModeDropdown';
import SortdDropdown from './NFTs/SortDropdown';

export function TabHeader({
  activeTab,
}: {
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
}) {
  const { currentAddress: address } = useCurrentAddressStore();
  const { hideAssetBalances } = useHideAssetBalancesStore();
  const { data: balance, isLoading } = useBalance({ address });
  const { display: userAssetsBalanceDisplay } = useUserAssetsBalance();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { visibleTokenCount } = useVisibleTokenCount();
  const { featureFlags } = useFeatureFlagsStore();
  const nftCount = getNftCount({ address });

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
    <Inset bottom="20px" top="8px">
      <Box
        display="flex"
        justifyContent="space-between"
        paddingHorizontal="20px"
        style={{
          maxHeight: 11,
          textTransform: 'capitalize',
        }}
        width="full"
        alignItems="center"
      >
        <Inline alignVertical="bottom" space="6px">
          <Text size="16pt" weight="heavy">
            {i18n.t(`tabs.${activeTab}`)}
          </Text>
          {activeTab === 'tokens' && visibleTokenCount > 0 && (
            <Text color="labelQuaternary" size="14pt" weight="bold">
              {visibleTokenCount}
            </Text>
          )}
          {activeTab === 'nfts' &&
            featureFlags.nfts_enabled &&
            nftCount > 0 && (
              <Text color="labelQuaternary" size="14pt" weight="bold">
                {nftCount}
              </Text>
            )}
        </Inline>
        {isLoading && (
          <Inline alignVertical="center">
            <Skeleton width="62px" height="11px" />
          </Inline>
        )}

        {(activeTab !== 'nfts' || !featureFlags.nfts_enabled) && balance && (
          <CursorTooltip
            align="end"
            arrowAlignment="right"
            text={i18n.t('tooltip.balance')}
            textWeight="bold"
            textSize="12pt"
            textColor="labelSecondary"
          >
            <Inline alignVertical="center">{displayBalanceComponent}</Inline>
          </CursorTooltip>
        )}
        {activeTab === 'nfts' && featureFlags.nfts_enabled && (
          <Inline alignVertical="center" space="8px">
            <DisplayModeDropdown />
            <SortdDropdown />
          </Inline>
        )}
      </Box>
    </Inset>
  );
}
