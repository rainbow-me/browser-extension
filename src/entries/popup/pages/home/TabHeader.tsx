import { useMemo } from 'react';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { Box, Inline, Inset, Text } from '~/design-system';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';

import { Asterisks } from '../../components/Asterisks/Asterisks';
import { Tab } from '../../components/Tabs/TabBar';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { useUserAssetsBalance } from '../../hooks/useUserAssetsBalance';
import { useVisibleTokenCount } from '../../hooks/useVisibleTokenCount';

import DisplayModeDropdown from './NFTs/DisplayModeDropdown';
import SortDropdown from './NFTs/SortDropdown';

export function TabHeader({
  activeTab,
}: {
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
}) {
  const { hideAssetBalances } = useHideAssetBalancesStore();
  const { display: userAssetsBalanceDisplay, isLoading } =
    useUserAssetsBalance();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { visibleTokenCount } = useVisibleTokenCount();

  const displayBalanceComponent = useMemo(() => {
    if (isLoading) return <Skeleton width="62px" height="11px" />;

    return hideAssetBalances ? (
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
        {userAssetsBalanceDisplay || ''}
      </Text>
    );
  }, [
    activeTab,
    currentCurrency,
    hideAssetBalances,
    userAssetsBalanceDisplay,
    isLoading,
  ]);

  const tabTitle = useMemo(() => {
    const rewardsEnabled =
      config.rewards_enabled || process.env.INTERNAL_BUILD === 'true';

    switch (activeTab) {
      case 'points':
        return rewardsEnabled ? i18n.t('tabs.rewards') : i18n.t('tabs.points');
      default:
        return i18n.t(`tabs.${activeTab}`);
    }
  }, [activeTab]);

  const shouldDisplayBalanceComponent =
    activeTab !== 'nfts' && activeTab !== 'points';

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
          <Text
            size="16pt"
            weight="heavy"
            textShadow={activeTab === 'points' ? '12px accent' : undefined}
            color={activeTab === 'points' ? 'accent' : 'label'}
          >
            {tabTitle}
          </Text>
          {activeTab === 'tokens' && visibleTokenCount > 0 && (
            <Text color="labelQuaternary" size="14pt" weight="bold">
              {visibleTokenCount}
            </Text>
          )}
        </Inline>
        {isLoading && (
          <Inline alignVertical="center">
            <Skeleton width="62px" height="11px" />
          </Inline>
        )}

        {shouldDisplayBalanceComponent && (
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
        {activeTab === 'nfts' && (
          <Inline alignVertical="center" space="8px">
            <DisplayModeDropdown />
            <SortDropdown />
          </Inline>
        )}
      </Box>
    </Inset>
  );
}
