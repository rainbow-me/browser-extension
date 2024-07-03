import { useMemo } from 'react';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import {
  abbreviateNumber,
  convertRawAmountToBalance,
  convertRawAmountToNativeDisplay,
} from '~/core/utils/numbers';
import {
  Box,
  Column,
  Columns,
  Inline,
  Stack,
  Text,
  TextOverflow,
} from '~/design-system';
import { AccentColorProvider } from '~/design-system/components/Box/ColorContext';
import { transparentAccentColorAsHsl } from '~/design-system/styles/core.css';
import { CoinIcon } from '~/entries/popup/components/CoinIcon/CoinIcon';

export type SwapAssetCardProps = {
  asset: ParsedSearchAsset;
  assetAmount: string;
  testId: string;
};

export const SwapAssetCard = ({
  asset,
  assetAmount,
  testId,
}: SwapAssetCardProps) => {
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

  const amountWithAbbreviation = abbreviateNumber(amount);

  console.log('amountWIthAbbreviation: ', amountWithAbbreviation);

  return (
    <AccentColorProvider
      color={asset?.colors?.primary || asset?.colors?.fallback}
    >
      <Box
        borderRadius="24px"
        style={{
          width: '143px',
          height: '128px',
          backgroundColor: transparentAccentColorAsHsl,
        }}
        testId={`${testId}-swap-asset-card`}
      >
        <Box paddingVertical="27px" paddingHorizontal="8px">
          <Stack space="10px">
            <Inline alignHorizontal="center">
              <Box>
                <CoinIcon size={36} asset={asset} />
              </Box>
            </Inline>
            <Box>
              <Stack space="10px" alignHorizontal="center">
                <Columns space="4px" alignVertical="center">
                  <Column>
                    <TextOverflow color="label" size="14pt" weight="bold">
                      {`${amountWithAbbreviation}`}
                    </TextOverflow>
                  </Column>
                  <Column width="content">
                    <Text color="label" size="14pt" weight="bold">
                      {`${asset?.symbol}`}
                    </Text>
                  </Column>
                </Columns>

                <TextOverflow color="labelSecondary" size="12pt" weight="bold">
                  {`${secondaryAmount}`}
                </TextOverflow>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </AccentColorProvider>
  );
};
