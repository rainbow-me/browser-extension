import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentCurrencyStore } from '~/core/state';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { Box, Inline, Inset, Text } from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';

import { Asterisks } from '../../components/Asterisks/Asterisks';
import { Tabs } from '../../components/Tabs/Tabs';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { useUserAssetsBalance } from '../../hooks/useUserAssetsBalance';
import { tabIndexes } from '../../utils/tabIndexes';

import { COLLAPSED_HEADER_TOP_OFFSET, Tab } from '.';

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
  const containerRef = useContainerRef();
  const { scrollY } = useScroll({
    container: containerRef,
    layoutEffect: false,
  });
  const [tooltipOffset, setTooltipOffset] = useState(scrollY.get() || 0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest <= COLLAPSED_HEADER_TOP_OFFSET) {
      setTooltipOffset(latest);
    }
  });

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
          <CursorTooltip
            align="start"
            arrowAlignment="left"
            text={i18n.t('tooltip.view_tokens')}
            textWeight="bold"
            textSize="12pt"
            textColor="labelSecondary"
            marginLeft="0px"
            marginTop={`${0 - tooltipOffset}px`}
            hint={shortcuts.global.BACK.display}
          >
            <Tabs.Tab
              active={activeTab === 'tokens'}
              onClick={() => onSelectTab('tokens')}
              symbol="record.circle.fill"
              text="Tokens"
              tabIndex={tabIndexes.WALLET_HEADER_TOKENS_TAB}
            />
          </CursorTooltip>
          <CursorTooltip
            align="center"
            arrowAlignment="center"
            text={i18n.t('tooltip.view_activity')}
            textWeight="bold"
            textSize="12pt"
            textColor="labelSecondary"
            marginLeft="120px"
            marginTop={`${0 - tooltipOffset}px`}
            hint={shortcuts.global.FORWARD.display}
          >
            <Tabs.Tab
              active={activeTab === 'activity'}
              onClick={() => onSelectTab('activity')}
              symbol="bolt.fill"
              text="Activity"
              tabIndex={tabIndexes.WALLET_HEADER_ACTIVITY_TAB}
            />
          </CursorTooltip>
        </Tabs>
      </Box>
      <CursorTooltip
        align="end"
        arrowAlignment="right"
        text={i18n.t('tooltip.balance')}
        textWeight="bold"
        textSize="12pt"
        textColor="labelSecondary"
        marginLeft="322px"
        marginTop={`${0 - tooltipOffset}px`}
      >
        <Inset top="4px">
          {isLoading && (
            <Inline alignVertical="center">
              <Skeleton width="62px" height="11px" />
            </Inline>
          )}

          {balance && (
            <Inline alignVertical="center">{displayBalanceComponent}</Inline>
          )}
        </Inset>
      </CursorTooltip>
    </Box>
  );
}
