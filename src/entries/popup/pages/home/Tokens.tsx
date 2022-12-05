import React, { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { UniqueId } from '~/core/types/assets';
import { Box, Column, Columns, Text } from '~/design-system';
import { CoinRow } from '~/entries/popup/components/CoinRow/CoinRow';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';

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

function AssetRow({ uniqueId }: AssetRowProps) {
  const asset = useUserAsset(uniqueId);
  const name = asset?.name;

  const priceChange = asset?.native?.price?.change;
  const priceChangeDisplay = priceChange?.length ? priceChange : '-';
  const priceChangeColor =
    priceChangeDisplay[0] !== '-' ? 'green' : 'labelTertiary';

  const balanceDisplay = asset?.balance?.display;
  const nativeBalanceDisplay = asset?.native?.balance?.display;

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
          <Box paddingVertical="4px">
            <Text size="14pt" weight="semibold" align="right">
              {nativeBalanceDisplay}
            </Text>
          </Box>
        </Column>
      </Columns>
    ),
    [name, nativeBalanceDisplay],
  );

  const bottomRow = useMemo(
    () => (
      <Columns>
        <Column width="content">
          <Box paddingVertical="4px">
            <Text color="labelTertiary" size="12pt" weight="semibold">
              {balanceDisplay}
            </Text>
          </Box>
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
