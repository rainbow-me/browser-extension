import { useMemo } from 'react';

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
    switch (activeTab) {
      case 'rewards':
        return i18n.t('tabs.rewards');
      default:
        return i18n.t(`tabs.${activeTab}`);
    }
  }, [activeTab]);

  const shouldDisplayBalanceComponent =
    activeTab !== 'nfts' && activeTab !== 'rewards';

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
            textShadow={activeTab === 'rewards' ? '12px accent' : undefined}
            color={activeTab === 'rewards' ? 'accent' : 'label'}
          >
            {tabTitle}
          </Text>
          {activeTab === 'tokens' &&
            (isLoading ? (
              <Skeleton width="48px" height="11px" />
            ) : (
              visibleTokenCount > 0 && (
                <Text color="labelQuaternary" size="14pt" weight="bold">
                  {visibleTokenCount}
                </Text>
              )
            ))}
        </Inline>

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
