import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { memo, useMemo, useState } from 'react';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { shortcuts } from '~/core/references/shortcuts';
import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { UniqueId } from '~/core/types/assets';
import {
  Box,
  Column,
  Columns,
  Inline,
  Inset,
  Symbol,
  Text,
} from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';

import { TokensSkeleton } from '../../components/ActivitySkeleton/ActivitySkeleton';
import { Asterisks } from '../../components/Asterisks/Asterisks';
import { CoinbaseIcon } from '../../components/CoinbaseIcon/CoinbaseIcon';
import { WalletIcon } from '../../components/WalletIcon/WalletIcon';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useTokensShortcuts } from '../../hooks/useTokensShortcuts';

export function Tokens() {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();
  const [manuallyRefetchingTokens, setManuallyRefetchingTokens] =
    useState(false);

  const {
    data: assets = [],
    isInitialLoading,
    refetch: refetchUserAssets,
  } = useUserAssets(
    {
      address: currentAddress,
      currency,
      connectedToHardhat,
    },
    {
      select: selectUserAssetsList,
    },
  );

  const containerRef = useContainerRef();
  const assetsRowVirtualizer = useVirtualizer({
    count: assets?.length || 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 52,
    overscan: 20,
  });

  useKeyboardShortcut({
    handler: async (e: KeyboardEvent) => {
      if (e.key === shortcuts.tokens.REFRESH_TOKENS.key) {
        setManuallyRefetchingTokens(true);
        await refetchUserAssets();
        setManuallyRefetchingTokens(false);
      }
    },
    condition: () => !manuallyRefetchingTokens,
  });

  useTokensShortcuts();
  const navigate = useRainbowNavigate();

  if (isInitialLoading || manuallyRefetchingTokens) {
    return <TokensSkeleton />;
  }

  if (!assets?.length) {
    return <TokensEmptyState />;
  }

  return (
    <Box
      width="full"
      style={{
        overflow: 'auto',
        // prevent coin icon shadow from clipping in empty space when list is small
        paddingBottom:
          assetsRowVirtualizer.getVirtualItems().length > 6 ? 8 : 60,
      }}
      paddingTop="2px"
      marginTop="-16px"
    >
      <Box
        width="full"
        style={{
          height: assetsRowVirtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        <Box style={{ overflow: 'auto' }}>
          {assetsRowVirtualizer.getVirtualItems().map((virtualItem) => {
            const { key, index, start, size } = virtualItem;
            const rowData = assets[index];
            return (
              <Box
                key={key}
                onClick={() =>
                  navigate('token-details', {
                    state: { uniqueId: rowData.uniqueId },
                  })
                }
                as={motion.div}
                whileTap={{ scale: 0.98 }}
                layoutId={`list-${index}`}
                layoutScroll
                layout="position"
                position="absolute"
                width="full"
                style={{ height: size, y: start }}
              >
                {/* <TokenDetailsMenu token={rowData}> */}
                <AssetRow
                  key={`${rowData?.uniqueId}-${index}`}
                  uniqueId={rowData?.uniqueId}
                />
                {/* </TokenDetailsMenu> */}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

type AssetRowProps = {
  uniqueId: UniqueId;
};

export const AssetRow = memo(function AssetRow({ uniqueId }: AssetRowProps) {
  const asset = useUserAsset(uniqueId);
  const name = asset?.name;
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
      hideAssetBalances ? (
        <Inline alignHorizontal="right">
          <TextOverflow size="14pt" weight="semibold" align="right">
            {supportedCurrencies[currentCurrency].symbol}
          </TextOverflow>
          <Asterisks color="label" size={10} />
        </Inline>
      ) : (
        <Text size="14pt" weight="semibold" align="right">
          {asset?.native?.balance?.display}
        </Text>
      ),
    [asset?.native?.balance?.display, hideAssetBalances, currentCurrency],
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
          <Box paddingVertical="4px">{balanceDisplay}</Box>
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
    [balanceDisplay, priceChangeColor, priceChangeDisplay],
  );

  return <CoinRow asset={asset} topRow={topRow} bottomRow={bottomRow} />;
});

function TokensEmptyState() {
  return (
    <Inset horizontal="20px">
      <Box paddingBottom="8px">
        <a
          style={{ cursor: 'default' }}
          href="https://www.coinbase.com/"
          target="_blank"
          rel="noreferrer"
        >
          <Box
            background="surfaceSecondaryElevated"
            borderRadius="16px"
            borderColor="separatorTertiary"
            boxShadow="12px"
          >
            <Inset horizontal="16px" vertical="16px">
              <Box paddingBottom="12px">
                <Inline alignVertical="center" alignHorizontal="justify">
                  <Box>
                    <Inline alignVertical="center" space="8px">
                      <CoinbaseIcon />
                      <Text as="p" size="14pt" color="label" weight="semibold">
                        {i18n.t('tokens_tab.coinbase_title')}
                      </Text>
                    </Inline>
                  </Box>
                  <Symbol
                    size={12}
                    symbol="arrow.up.forward.circle"
                    weight="semibold"
                    color="labelTertiary"
                  />
                </Inline>
              </Box>
              <Text as="p" size="11pt" color="labelSecondary" weight="bold">
                {i18n.t('tokens_tab.coinbase_description')}
              </Text>
            </Inset>
          </Box>
        </a>
      </Box>

      <Box
        background="surfacePrimaryElevated"
        borderRadius="16px"
        borderColor="separatorTertiary"
        boxShadow="12px"
        borderWidth="1px"
      >
        <Inset horizontal="16px" vertical="16px">
          <Box paddingBottom="12px">
            <Inline alignVertical="center" space="8px">
              <WalletIcon />
              <Text as="p" size="14pt" color="label" weight="semibold">
                {i18n.t('tokens_tab.send_from_wallet')}
              </Text>
            </Inline>
          </Box>
          <Text as="p" size="11pt" color="labelSecondary" weight="bold">
            {i18n.t('tokens_tab.send_description_1')}
            <Box
              background="fillSecondary"
              as="span"
              style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                verticalAlign: 'middle',
                textAlign: 'center',
                lineHeight: '16px',
              }}
            >
              C
            </Box>
            {i18n.t('tokens_tab.send_description_2')}
          </Text>
        </Inset>
      </Box>
    </Inset>
  );
}
