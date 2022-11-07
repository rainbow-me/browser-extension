import React, { Fragment, useMemo } from 'react';
import { useAccount } from 'wagmi';

import { selectUserAssetsList } from '~/core/resources/_selectors';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { UniqueId } from '~/core/types/assets';
import { Box, Text } from '~/design-system';
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
    <Box marginTop="-20px">
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

  const leftColumn = useMemo(
    () => (
      <Fragment>
        <Text size="14pt" weight="semibold">
          {name}
        </Text>
        <Text color="labelTertiary" size="12pt" weight="semibold">
          {balanceDisplay}
        </Text>
      </Fragment>
    ),
    [balanceDisplay, name],
  );

  const rightColumn = useMemo(
    () => (
      <Fragment>
        <Text size="14pt" weight="semibold">
          {nativeBalanceDisplay}
        </Text>
        <Text
          color={priceChangeColor}
          size="12pt"
          weight="semibold"
          align="right"
        >
          {priceChangeDisplay}
        </Text>
      </Fragment>
    ),
    [nativeBalanceDisplay, priceChangeColor, priceChangeDisplay],
  );

  return (
    <CoinRow
      leftColumn={leftColumn}
      rightColumn={rightColumn}
      uniqueId={uniqueId}
    />
  );
}
