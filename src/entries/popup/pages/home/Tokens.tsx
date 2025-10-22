import { useVirtualizer } from '@tanstack/react-virtual';
import {
  AnimatePresence,
  MotionValue,
  motion,
  useTransform,
} from 'framer-motion';
import uniqBy from 'lodash/uniqBy';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { shortcuts } from '~/core/references/shortcuts';
import { selectUserAssetsList } from '~/core/resources/_selectors';
import { selectorFilterByUserChains } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { fetchProviderWidgetUrl } from '~/core/resources/f2c';
import { FiatProviderName } from '~/core/resources/f2c/types';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useHideSmallBalancesStore } from '~/core/state/currentSettings/hideSmallBalances';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import {
  computeUniqueIdForHiddenAsset,
  useHiddenAssetStore,
} from '~/core/state/hiddenAssets/hiddenAssets';
import { usePinnedAssetStore } from '~/core/state/pinnedAssets';
import { ParsedAssetsDictByChain, ParsedUserAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
import {
  compareCappedAmountToCalculatedValue,
  getCappedAmount,
} from '~/core/utils/assets';
import { isCustomChain } from '~/core/utils/chains';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Inset,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';

import { Asterisks } from '../../components/Asterisks/Asterisks';
import { CoinbaseIcon } from '../../components/CoinbaseIcon/CoinbaseIcon';
import { QuickPromo } from '../../components/QuickPromo/QuickPromo';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useSystemSpecificModifierKey } from '../../hooks/useSystemSpecificModifierKey';
import { useTokenListSampling } from '../../hooks/useTokenListSampling';
import { useTokenPressMouseEvents } from '../../hooks/useTokenPressMouseEvents';
import { useTokensShortcuts } from '../../hooks/useTokensShortcuts';
import { ROUTES } from '../../urls';

import { TokensSkeleton } from './Skeletons';
import { TokenContextMenu } from './TokenDetails/TokenContextMenu';
import { TokenMarkedHighlighter } from './TokenMarkedHighlighter';

type AssetsSelection = {
  visible: ParsedUserAsset[];
  hidden: ParsedUserAsset[];
  all: ParsedUserAsset[];
};

const TokenRow = memo(function TokenRow({
  token,
  testId,
}: {
  token: ParsedUserAsset;
  testId: string;
}) {
  const navigate = useRainbowNavigate();
  const openDetails = () => {
    navigate(ROUTES.TOKEN_DETAILS(token.uniqueId), {
      state: { skipTransitionOnRoute: ROUTES.HOME },
    });
  };

  const { onMouseDown, onMouseUp, onMouseLeave } = useTokenPressMouseEvents({
    token,
    onClick: openDetails,
  });

  return (
    <Box
      as={motion.div}
      whileTap={{ scale: 0.98 }}
      width="full"
      layoutScroll
      layout="position"
    >
      <TokenContextMenu token={token}>
        <Box
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <AssetRow asset={token} testId={testId} />
        </Box>
      </TokenContextMenu>
    </Box>
  );
});

export function Tokens({ scrollY }: { scrollY: MotionValue<number> }) {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const [manuallyRefetchingTokens, setManuallyRefetchingTokens] =
    useState(false);
  const { hideSmallBalances } = useHideSmallBalancesStore();
  const { trackShortcut } = useKeyboardAnalytics();
  const { modifierSymbol } = useSystemSpecificModifierKey();
  const { pinned: pinnedStore } = usePinnedAssetStore();
  const { hidden } = useHiddenAssetStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const overflow = useTransform(scrollY, (p) => (p > 92 ? 'auto' : 'hidden'));

  const isHidden = useCallback(
    (asset: ParsedUserAsset) => {
      return !!hidden[currentAddress]?.[computeUniqueIdForHiddenAsset(asset)];
    },
    [currentAddress, hidden],
  );

  const buildAssetSelection = useCallback(
    (data: ParsedAssetsDictByChain): AssetsSelection => {
      const allAssets = selectorFilterByUserChains({
        data,
        selector: selectUserAssetsList,
      });

      const smallBalanceAssets = allAssets.filter(
        (asset) => asset.smallBalance,
      );
      const visibleAssets = hideSmallBalances
        ? allAssets.filter((asset) => !asset.smallBalance)
        : allAssets;

      return {
        all: allAssets,
        visible: visibleAssets,
        hidden: smallBalanceAssets,
      };
    },
    [hideSmallBalances],
  );

  const {
    data: userAssetsData,
    isLoading: isUserAssetsLoading,
    refetch: refetchUserAssets,
  } = useUserAssets<AssetsSelection>(
    {
      address: currentAddress,
      currency,
    },
    {
      select: buildAssetSelection,
    },
  );

  const { data: customNetworkAssetsData, refetch: refetchCustomNetworkAssets } =
    useCustomNetworkAssets<AssetsSelection>(
      {
        address: currentAddress,
        currency,
      },
      {
        select: buildAssetSelection,
      },
    );

  const [
    userVisibleAssets,
    userHiddenSmallAssets,
    customVisibleAssets,
    customHiddenSmallAssets,
  ] = useMemo(
    () => [
      userAssetsData?.visible ?? [],
      userAssetsData?.hidden ?? [],
      customNetworkAssetsData?.visible ?? [],
      customNetworkAssetsData?.hidden ?? [],
    ],
    [userAssetsData, customNetworkAssetsData],
  );

  const isPinned = useCallback(
    (assetUniqueId: string) =>
      !!pinnedStore[currentAddress]?.[assetUniqueId]?.pinned,
    [currentAddress, pinnedStore],
  );

  const combinedVisibleAssets = useMemo(
    () =>
      Array.from(
        new Map(
          [...customVisibleAssets, ...userVisibleAssets].map((item) => [
            item.uniqueId,
            item,
          ]),
        ).values(),
      ),
    [customVisibleAssets, userVisibleAssets],
  );

  const combinedHiddenSmallAssets = useMemo(
    () =>
      Array.from(
        new Map(
          [...customHiddenSmallAssets, ...userHiddenSmallAssets].map((item) => [
            item.uniqueId,
            item,
          ]),
        ).values(),
      ),
    [customHiddenSmallAssets, userHiddenSmallAssets],
  );

  const visibleAssetsUnhidden = useMemo(
    () => combinedVisibleAssets.filter((asset) => !isHidden(asset)),
    [combinedVisibleAssets, isHidden],
  );

  const hiddenSmallAssetsUnhidden = useMemo(
    () => combinedHiddenSmallAssets.filter((asset) => !isHidden(asset)),
    [combinedHiddenSmallAssets, isHidden],
  );

  const computeUniqueAssets = useCallback(
    (assets: ParsedUserAsset[]) => {
      const filteredAssets = assets.filter(
        ({ uniqueId }) => !isPinned(uniqueId),
      );

      return uniqBy(filteredAssets, 'uniqueId').sort(
        (a: ParsedUserAsset, b: ParsedUserAsset) =>
          getCappedAmount(b) - getCappedAmount(a),
      );
    },
    [isPinned],
  );

  const computePinnedAssets = useCallback(
    (assets: ParsedUserAsset[]) => {
      const filteredAssets = assets.filter((asset) => isPinned(asset.uniqueId));

      const sortedAssets = filteredAssets.sort((a, b) => {
        const pinnedFirstAsset = pinnedStore[currentAddress]?.[a.uniqueId];
        const pinnedSecondAsset = pinnedStore[currentAddress]?.[b.uniqueId];

        // This won't happen, but we'll just return to it's
        // default sorted order just in case it will happen
        if (!pinnedFirstAsset || !pinnedSecondAsset) return 0;

        return pinnedFirstAsset.createdAt - pinnedSecondAsset.createdAt;
      });

      return sortedAssets;
    },
    [currentAddress, pinnedStore, isPinned],
  );

  const orderedVisibleAssets = useMemo(
    () => [
      ...computePinnedAssets(visibleAssetsUnhidden),
      ...computeUniqueAssets(visibleAssetsUnhidden),
    ],
    [visibleAssetsUnhidden, computePinnedAssets, computeUniqueAssets],
  );

  const orderedHiddenSmallAssets = useMemo(
    () => [
      ...computePinnedAssets(hiddenSmallAssetsUnhidden),
      ...computeUniqueAssets(hiddenSmallAssetsUnhidden),
    ],
    [hiddenSmallAssetsUnhidden, computePinnedAssets, computeUniqueAssets],
  );

  const shouldShowSmallBalanceToggle =
    hideSmallBalances && orderedHiddenSmallAssets.length > 0;

  const [showHiddenSmallBalances, setShowHiddenSmallBalances] = useState(false);

  useEffect(() => {
    if (!shouldShowSmallBalanceToggle) {
      setShowHiddenSmallBalances(false);
    }
  }, [shouldShowSmallBalanceToggle]);

  const hasAnyAssets =
    orderedVisibleAssets.length > 0 || orderedHiddenSmallAssets.length > 0;

  const paddingEnd = shouldShowSmallBalanceToggle ? 16 : 64;

  const assetsRowVirtualizer = useVirtualizer({
    count: orderedVisibleAssets.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 52,
    overscan: 10,
    paddingEnd,
    paddingStart: 8,
    getItemKey: (index) =>
      orderedVisibleAssets[index]?.uniqueId ?? `token-${index}`,
  });

  useKeyboardShortcut({
    handler: async (e: KeyboardEvent) => {
      if (e.key === shortcuts.tokens.REFRESH_TOKENS.key) {
        trackShortcut({
          key: shortcuts.tokens.REFRESH_TOKENS.display,
          type: 'tokens.refresh',
        });
        setManuallyRefetchingTokens(true);
        await Promise.all([refetchUserAssets(), refetchCustomNetworkAssets()]);
        setManuallyRefetchingTokens(false);
      }
    },
    condition: () => !manuallyRefetchingTokens,
  });

  useTokensShortcuts();
  const samplingAssets = useMemo(
    () =>
      shouldShowSmallBalanceToggle && showHiddenSmallBalances
        ? [...orderedVisibleAssets, ...orderedHiddenSmallAssets]
        : orderedVisibleAssets,
    [
      orderedVisibleAssets,
      orderedHiddenSmallAssets,
      shouldShowSmallBalanceToggle,
      showHiddenSmallBalances,
    ],
  );

  const hiddenContainerRef = useRef<HTMLDivElement>(null);

  const hiddenAssetsRowVirtualizer = useVirtualizer({
    count: orderedHiddenSmallAssets.length,
    getScrollElement: () => hiddenContainerRef.current,
    estimateSize: () => 52,
    overscan: 6,
    paddingEnd: 16,
    paddingStart: 8,
    getItemKey: (index) =>
      orderedHiddenSmallAssets[index]?.uniqueId ?? `hidden-token-${index}`,
  });

  useTokenListSampling(samplingAssets, 'wallet');

  useEffect(() => {
    assetsRowVirtualizer?.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedVisibleAssets.length]);

  useEffect(() => {
    if (showHiddenSmallBalances) {
      hiddenAssetsRowVirtualizer?.measure();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHiddenSmallBalances, orderedHiddenSmallAssets.length]);

  if (isUserAssetsLoading || manuallyRefetchingTokens) {
    return <TokensSkeleton />;
  }

  if (!hasAnyAssets) {
    return <TokensEmptyState depositAddress={currentAddress} />;
  }

  return (
    <Box
      as={motion.div}
      width="full"
      style={{
        maxHeight: `1200px`,
        overflow: overflow,
      }}
      ref={containerRef}
      paddingBottom="80px"
    >
      <QuickPromo
        text={i18n.t('command_k.quick_promo.text', { modifierSymbol })}
        textBold={i18n.t('command_k.quick_promo.text_bold')}
        style={{
          paddingBottom: 12,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
        }}
        symbol="sparkle"
        symbolColor="accent"
        promoType="command_k"
      />
      <Box
        width="full"
        style={{
          height: `${assetsRowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        <Box>
          {assetsRowVirtualizer.getVirtualItems().map((virtualItem) => {
            const { key, size, start, index } = virtualItem;
            const token = orderedVisibleAssets[index];
            if (!token) return null;
            const pinned =
              !!pinnedStore[currentAddress]?.[token.uniqueId]?.pinned;

            return (
              <Box
                key={`token-list-${token.uniqueId}-${key}`}
                layoutId={`token-list-${index}`}
                as={motion.div}
                position="absolute"
                width="full"
                style={{
                  height: size,
                  y: start,
                }}
              >
                {pinned && <TokenMarkedHighlighter />}
                <TokenRow token={token} testId={`coin-row-item-${index}`} />
              </Box>
            );
          })}
        </Box>
      </Box>
      {shouldShowSmallBalanceToggle && (
        <Box
          width="full"
          alignItems="center"
          justifyContent="center"
          display="flex"
        >
          <Button
            color="surfaceSecondaryElevated"
            height="32px"
            variant="transparent"
            width="fit"
            onClick={() =>
              setShowHiddenSmallBalances((prevState) => !prevState)
            }
            testId="show-small-balances-button"
          >
            <Inline alignVertical="center" space="6px">
              <motion.div
                animate={{ rotate: showHiddenSmallBalances ? -180 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex' }}
              >
                <Symbol
                  color="labelSecondary"
                  size={12}
                  symbol="chevron.down"
                  weight="semibold"
                />
              </motion.div>
              <Text size="12pt" weight="semibold" color="labelSecondary">
                {showHiddenSmallBalances
                  ? i18n.t('tokens_tab.small_balances_show_less')
                  : i18n.t('tokens_tab.small_balances_show_more')}
              </Text>
            </Inline>
          </Button>
        </Box>
      )}
      <AnimatePresence initial={false}>
        {shouldShowSmallBalanceToggle && showHiddenSmallBalances && (
          <motion.div
            key="hidden-small-balances"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', width: '100%' }}
          >
            <Box
              ref={hiddenContainerRef}
              width="full"
              paddingBottom="16px"
              style={{
                height: `${hiddenAssetsRowVirtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {hiddenAssetsRowVirtualizer
                .getVirtualItems()
                .map((virtualItem) => {
                  const { key, size, start, index } = virtualItem;
                  const token = orderedHiddenSmallAssets[index];
                  if (!token) return null;
                  const pinned =
                    !!pinnedStore[currentAddress]?.[token.uniqueId]?.pinned;
                  return (
                    <Box
                      key={`hidden-small-${token.uniqueId}-${key}`}
                      layoutId={`hidden-token-list-${index}`}
                      as={motion.div}
                      position="absolute"
                      width="full"
                      style={{
                        height: size,
                        y: start,
                      }}
                    >
                      {pinned && <TokenMarkedHighlighter />}
                      <TokenRow
                        token={token}
                        testId={`hidden-small-coin-row-item-${index}`}
                      />
                    </Box>
                  );
                })}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

type AssetRowProps = {
  asset: ParsedUserAsset;
  testId?: string;
};

export const AssetRow = memo(function AssetRow({
  asset,
  testId,
}: AssetRowProps) {
  const name = asset?.name || asset?.symbol || truncateAddress(asset.address);
  const uniqueId = asset?.uniqueId;
  const { hideAssetBalances } = useHideAssetBalancesStore();
  const { currentCurrency } = useCurrentCurrencyStore();

  const priceChange = asset?.native?.price?.change;
  const priceChangeDisplay = priceChange?.length ? priceChange : '-';
  const priceChangeColor =
    priceChangeDisplay[0] !== '-' ? 'green' : 'labelTertiary';
  const { shouldApproximate } = useMemo(
    () =>
      compareCappedAmountToCalculatedValue({
        cappedAmount: asset.balance.capped?.amount,
        calculatedAmount: asset.native.balance.amount,
      }),
    [asset.native.balance.amount, asset.balance.capped?.amount],
  );
  const platformDisplay =
    asset.balance.capped?.display ?? asset.native.balance.display;
  const displayWithApproximation = shouldApproximate
    ? `~${platformDisplay}`
    : platformDisplay;

  const balanceDisplay = useMemo(
    () =>
      hideAssetBalances ? (
        <Inline space="4px">
          <Asterisks color="labelTertiary" size={8} />
          <TextOverflow color="labelTertiary" size="12pt" weight="semibold">
            {asset?.symbol}
          </TextOverflow>
        </Inline>
      ) : (
        <TextOverflow color="labelTertiary" size="12pt" weight="semibold">
          {asset?.balance?.display}
        </TextOverflow>
      ),
    [asset?.balance?.display, asset?.symbol, hideAssetBalances],
  );

  const nativeBalanceDisplay = useMemo(
    () =>
      // eslint-disable-next-line no-nested-ternary
      hideAssetBalances ? (
        <Inline alignHorizontal="right">
          <TextOverflow size="14pt" weight="semibold" align="right">
            {supportedCurrencies[currentCurrency].symbol}
          </TextOverflow>
          <Asterisks color="label" size={10} />
        </Inline>
      ) : isCustomChain(asset.chainId) &&
        (asset.balance.capped?.amount ?? asset.native.balance.amount) ===
          '0' ? null : (
        <Text size="14pt" weight="semibold" align="right">
          {displayWithApproximation}
        </Text>
      ),
    [
      hideAssetBalances,
      currentCurrency,
      asset.chainId,
      asset.balance.capped?.amount,
      asset.native.balance.amount,
      displayWithApproximation,
    ],
  );

  const topRow = useMemo(
    () => (
      <Columns>
        <Column>
          <Box paddingVertical="4px">
            <TextOverflow size="14pt" weight="semibold">
              {name}
            </TextOverflow>
          </Box>
        </Column>
        <Column width="content">
          <Box paddingVertical="4px">{nativeBalanceDisplay}</Box>
        </Column>
      </Columns>
    ),
    [name, nativeBalanceDisplay],
  );

  const bottomRow = useMemo(
    () => (
      <Columns>
        <Column>
          <Box paddingVertical="4px" testId={`asset-name-${uniqueId}`}>
            {balanceDisplay}
          </Box>
        </Column>
        <Column width="content">
          <Box paddingVertical="4px">
            <Text
              color={priceChangeColor}
              size="12pt"
              weight="semibold"
              align="right"
            >
              {priceChangeDisplay}
            </Text>
          </Box>
        </Column>
      </Columns>
    ),
    [balanceDisplay, priceChangeColor, priceChangeDisplay, uniqueId],
  );

  return (
    <CoinRow
      testId={testId}
      asset={asset}
      topRow={topRow}
      bottomRow={bottomRow}
    />
  );
});

type EmptyStateProps = {
  depositAddress: Address;
};

function TokensEmptyState({ depositAddress }: EmptyStateProps) {
  const { currentTheme } = useCurrentThemeStore();
  const { testnetMode } = useTestnetModeStore();
  const handleCoinbase = useCallback(async () => {
    const { data } = await fetchProviderWidgetUrl({
      provider: FiatProviderName.Coinbase,
      depositAddress,
      defaultExperience: 'send',
    });
    window.open(data.url, '_blank');
  }, [depositAddress]);

  return (
    <Inset horizontal="20px" top="20px">
      <Stack space="12px">
        {!testnetMode && (
          <Box
            background="surfaceSecondaryElevated"
            borderRadius="16px"
            boxShadow="12px"
            cursor="pointer"
            onClick={handleCoinbase}
            style={{ overflow: 'hidden' }}
          >
            <Box
              background={{ default: 'transparent', hover: 'fillQuaternary' }}
              cursor="pointer"
              height="full"
              padding="16px"
              width="full"
            >
              <Stack space="12px">
                <Inline alignVertical="center" alignHorizontal="justify">
                  <Box>
                    <Inline alignVertical="center" space="7px">
                      <Box
                        alignItems="center"
                        display="flex"
                        justifyContent="center"
                        style={{ height: 12, width: 18 }}
                      >
                        <CoinbaseIcon showBackground />
                      </Box>
                      <Text
                        as="p"
                        cursor="pointer"
                        size="14pt"
                        color="label"
                        weight="bold"
                      >
                        {i18n.t('tokens_tab.coinbase_title')}
                      </Text>
                    </Inline>
                  </Box>
                  <Symbol
                    cursor="pointer"
                    size={12}
                    symbol="arrow.up.forward.circle"
                    weight="semibold"
                    color="labelTertiary"
                  />
                </Inline>
                <Box alignItems="center" display="flex" style={{ height: 10 }}>
                  <Text
                    as="p"
                    cursor="pointer"
                    size="11pt"
                    color="labelTertiary"
                    weight="bold"
                  >
                    {i18n.t('tokens_tab.coinbase_description')}
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Box>
        )}

        {!testnetMode && (
          <Box
            borderRadius="16px"
            padding="16px"
            style={{
              boxShadow: `0 0 0 1px ${
                currentTheme === 'dark'
                  ? 'rgba(245, 248, 255, 0.025)'
                  : 'rgba(9, 17, 31, 0.03)'
              } inset`,
            }}
          >
            <Stack space="12px">
              <Inline alignVertical="center" space="7px">
                <Box
                  alignItems="center"
                  display="flex"
                  justifyContent="center"
                  style={{ height: 12, width: 18 }}
                >
                  <Symbol
                    color="accent"
                    size={16}
                    symbol="creditcard.fill"
                    weight="bold"
                  />
                </Box>
                <Text as="p" size="14pt" color="label" weight="bold">
                  {i18n.t('tokens_tab.buy_title')}
                </Text>
              </Inline>
              <Box alignItems="center" display="flex" style={{ height: 10 }}>
                <Text as="p" size="11pt" color="labelTertiary" weight="bold">
                  {i18n.t('tokens_tab.buy_description_1')}
                  <Box
                    background="fillTertiary"
                    as="span"
                    borderWidth="1px"
                    borderColor="separatorTertiary"
                    boxShadow="1px"
                    style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '14px',
                      borderRadius: '4.5px',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                      lineHeight: '12px',
                      marginLeft: '4px',
                      marginRight: '4px',
                    }}
                  >
                    {shortcuts.home.BUY.display}
                  </Box>
                  {i18n.t('tokens_tab.buy_description_2')}
                </Text>
              </Box>
            </Stack>
          </Box>
        )}

        <Box
          borderRadius="16px"
          padding="16px"
          style={{
            boxShadow: `0 0 0 1px ${
              currentTheme === 'dark'
                ? 'rgba(245, 248, 255, 0.025)'
                : 'rgba(9, 17, 31, 0.03)'
            } inset`,
          }}
        >
          <Stack space="12px">
            <Inline alignVertical="center" space="7px">
              <Box
                alignItems="center"
                display="flex"
                justifyContent="center"
                paddingLeft="2px"
                style={{ height: 12, width: 18 }}
              >
                <Symbol
                  color="accent"
                  size={14.5}
                  symbol="arrow.turn.right.down"
                  weight="bold"
                />
              </Box>
              <Text as="p" size="14pt" color="label" weight="bold">
                {i18n.t('tokens_tab.send_from_wallet')}
              </Text>
            </Inline>
            <Box alignItems="center" display="flex" style={{ height: 10 }}>
              <Text as="p" size="11pt" color="labelTertiary" weight="bold">
                {i18n.t('tokens_tab.send_description_1')}
                <Box
                  background="fillTertiary"
                  as="span"
                  borderWidth="1px"
                  borderColor="separatorTertiary"
                  boxShadow="1px"
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '14px',
                    borderRadius: '4.5px',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    lineHeight: '12px',
                    marginLeft: '4px',
                    marginRight: '4px',
                  }}
                >
                  {shortcuts.home.COPY_ADDRESS.display}
                </Box>
                {i18n.t('tokens_tab.send_description_2')}
                <Box
                  background="fillTertiary"
                  as="span"
                  borderWidth="1px"
                  borderColor="separatorTertiary"
                  boxShadow="1px"
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '14px',
                    borderRadius: '4.5px',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    lineHeight: '12px',
                    marginLeft: '4px',
                    marginRight: '4px',
                  }}
                >
                  {shortcuts.home.GO_TO_QR.display}
                </Box>
                {i18n.t('tokens_tab.send_description_3')}
              </Text>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Inset>
  );
}
