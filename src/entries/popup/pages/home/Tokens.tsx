import { useVirtualizer } from '@tanstack/react-virtual';
import { MotionValue, motion, useTransform } from 'framer-motion';
import uniqBy from 'lodash/uniqBy';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { shortcuts } from '~/core/references/shortcuts';
import { selectUserAssetsList } from '~/core/resources/_selectors';
import {
  selectUserAssetsFilteringSmallBalancesList,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
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
import { ParsedUserAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
import { isCustomChain } from '~/core/utils/chains';
import {
  Box,
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
import { useTokenPressMouseEvents } from '../../hooks/useTokenPressMouseEvents';
import { useTokensShortcuts } from '../../hooks/useTokensShortcuts';
import { ROUTES } from '../../urls';

import { TokensSkeleton } from './Skeletons';
import { TokenContextMenu } from './TokenDetails/TokenContextMenu';
import { TokenMarkedHighlighter } from './TokenMarkedHighlighter';

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

  const {
    data: assets = [],
    isFetching,
    isPending,
    refetch: refetchUserAssets,
  } = useUserAssets(
    {
      address: currentAddress,
      currency,
    },
    {
      select: (data) =>
        selectorFilterByUserChains({
          data,
          selector: hideSmallBalances
            ? selectUserAssetsFilteringSmallBalancesList
            : selectUserAssetsList,
        }),
    },
  );

  const {
    data: customNetworkAssets = [],
    refetch: refetchCustomNetworkAssets,
  } = useCustomNetworkAssets(
    {
      address: currentAddress,
      currency,
    },
    {
      select: (data) =>
        selectorFilterByUserChains({
          data,
          selector: hideSmallBalances
            ? selectUserAssetsFilteringSmallBalancesList
            : selectUserAssetsList,
        }),
    },
  );

  const isPinned = useCallback(
    (assetUniqueId: string) =>
      !!pinnedStore[currentAddress]?.[assetUniqueId]?.pinned,
    [currentAddress, pinnedStore],
  );

  const combinedAssets = useMemo(
    () =>
      Array.from(
        new Map(
          [...customNetworkAssets, ...assets].map((item) => [
            item.uniqueId,
            item,
          ]),
        ).values(),
      ),
    [assets, customNetworkAssets],
  );

  const unhiddenAssets = useMemo(() => {
    return combinedAssets.filter((asset) => !isHidden(asset));
  }, [combinedAssets, isHidden]);

  const computeUniqueAssets = useCallback(
    (assets: ParsedUserAsset[]) => {
      const filteredAssets = assets.filter(
        ({ uniqueId }) => !isPinned(uniqueId),
      );

      return uniqBy(filteredAssets, 'uniqueId').sort(
        (a: ParsedUserAsset, b: ParsedUserAsset) =>
          parseFloat(b?.native?.balance?.amount) -
          parseFloat(a?.native?.balance?.amount),
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

  const filteredAssets = useMemo(
    () => [
      ...computePinnedAssets(unhiddenAssets),
      ...computeUniqueAssets(unhiddenAssets),
    ],
    [unhiddenAssets, computePinnedAssets, computeUniqueAssets],
  );

  const assetsRowVirtualizer = useVirtualizer({
    count: filteredAssets.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 52,
    overscan: 10,
    paddingEnd: 64,
    paddingStart: 8,
    getItemKey: (index) => filteredAssets[index].uniqueId,
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

  useEffect(() => {
    assetsRowVirtualizer?.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unhiddenAssets?.length]);

  if ((isFetching && isPending) || manuallyRefetchingTokens) {
    return <TokensSkeleton />;
  }

  if (!filteredAssets?.length) {
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
      paddingBottom="8px"
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
            const token = filteredAssets[index];
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
        asset?.native?.balance?.amount === '0' ? null : (
        <Text size="14pt" weight="semibold" align="right">
          {asset?.native?.balance?.display}
        </Text>
      ),
    [
      hideAssetBalances,
      currentCurrency,
      asset.chainId,
      asset?.native?.balance?.amount,
      asset?.native?.balance?.display,
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
