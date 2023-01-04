import React, { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { supportedCurrencies } from '~/core/references';
import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { UniqueId } from '~/core/types/assets';
import { Box, Column, Columns, Inline, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';

const Asterisks = ({
  color,
  size,
}: {
  color: SymbolProps['color'];
  size: SymbolProps['size'];
}) => (
  <Inline>
    {Array(4)
      .fill(0)
      .map((_, i) => (
        <Symbol
          symbol={'asterisk'}
          weight={'bold'}
          size={size}
          color={color}
          key={i}
        />
      ))}
  </Inline>
);

export function Tokens() {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: assets = [] } = useUserAssets(
    { address, currency },
    { select: selectUserAssetsList },
  );
  return (
    <Box marginTop="-16px">
      {assets?.map((asset, i) => (
        <AssetRow key={`${asset?.uniqueId}-${i}`} uniqueId={asset?.uniqueId} />
      ))}
    </Box>
  );
}

type AssetRowProps = {
  uniqueId: UniqueId;
};

export function AssetRow({ uniqueId }: AssetRowProps) {
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
          <Text color="labelTertiary" size="12pt" weight="semibold">
            {asset?.symbol}
          </Text>
        </Inline>
      ) : (
        <Text color="labelTertiary" size="12pt" weight="semibold">
          {asset?.balance?.display}
        </Text>
      ),
    [asset?.balance?.display, asset?.symbol, hideAssetBalances],
  );
  const nativeBalanceDisplay = useMemo(
    () =>
      hideAssetBalances ? (
        <Inline alignHorizontal="right">
          <Text size="14pt" weight="semibold" align="right">
            {supportedCurrencies[currentCurrency].symbol}
          </Text>
          <Asterisks color="label" size={10} />
        </Inline>
      ) : (
        <Text size="14pt" weight="semibold" align="right">
          {asset?.native?.balance?.display}
        </Text>
      ),
    [asset?.native?.balance?.display, hideAssetBalances, currentCurrency],
  );

  console.log('asset', asset);

  const topRow = useMemo(
    () => (
      <Columns>
        <Column width="content">
          <Box paddingVertical="4px">
            <Text size="14pt" weight="semibold">
              {name}
            </Text>
          </Box>
        </Column>
        <Column>
          <Box paddingVertical="4px">{nativeBalanceDisplay}</Box>
        </Column>
      </Columns>
    ),
    [name, nativeBalanceDisplay],
  );

  const bottomRow = useMemo(
    () => (
      <Columns>
        <Column width="content">
          <Box paddingVertical="4px">{balanceDisplay}</Box>
        </Column>
        <Column>
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
}
