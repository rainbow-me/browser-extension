import React, { useMemo } from 'react';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import {
  convertRawAmountToBalance,
  convertRawAmountToNativeDisplay,
} from '~/core/utils/numbers';
import { Box, Inline, Stack, Text } from '~/design-system';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { transparentAccentColorAsHsl } from '~/design-system/styles/core.css';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';

export type SwapAssetCardProps = {
  asset: ParsedSearchAsset;
  assetAmount: string;
};

export const SwapAssetCard = ({ asset, assetAmount }: SwapAssetCardProps) => {
  const { currentCurrency } = useCurrentCurrencyStore();

  const amount = useMemo(
    () =>
      convertRawAmountToBalance(assetAmount, { decimals: asset?.decimals })
        .display,
    [asset?.decimals, assetAmount],
  );

  const secondaryAmount = useMemo(
    () =>
      convertRawAmountToNativeDisplay(
        assetAmount,
        asset.decimals,
        asset.price?.value || '0',
        currentCurrency,
      ).display,
    [asset.decimals, asset.price?.value, assetAmount, currentCurrency],
  );

  return (
    <AccentColorProviderWrapper
      color={asset?.colors?.primary || asset?.colors?.fallback}
    >
      <Box
        borderRadius="24px"
        style={{
          width: '143px',
          height: '128px',
          backgroundColor: transparentAccentColorAsHsl,
        }}
      >
        <Box paddingVertical="27px">
          <Stack space="10px">
            <Inline alignHorizontal="center">
              <Box>
                <CoinIcon size={36} asset={asset} />
              </Box>
            </Inline>
            <Box>
              <Stack space="10px" alignHorizontal="center">
                <Text color="label" size="14pt" weight="bold">
                  {`${amount} ${asset?.symbol}`}
                </Text>
                <Text color="labelSecondary" size="12pt" weight="bold">
                  {secondaryAmount}
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </AccentColorProviderWrapper>
  );
};
