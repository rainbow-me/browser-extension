import React from 'react';

import { i18n } from '~/core/languages';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { convertAmountAndPriceToNativeDisplay } from '~/core/utils/numbers';
import { Box, Inline, Symbol, Text, TextOverflow } from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { Tooltip } from '~/entries/popup/components/Tooltip/Tooltip';

const { innerWidth: windowWidth } = window;
const TEXT_MAX_WIDTH = windowWidth - 120;

export const TokenToSellInfo = ({
  asset,
  assetToSellValue,
  assetToSellMaxValue,
  setAssetToSellMaxValue,
}: {
  asset: ParsedSearchAsset | null;
  assetToSellValue: string;
  assetToSellMaxValue: { display: string; amount: string };
  setAssetToSellMaxValue: () => void;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();

  if (!asset) return null;
  return (
    <Box width="full">
      <Inline alignHorizontal="justify">
        {asset && (
          <TextOverflow
            maxWidth={TEXT_MAX_WIDTH}
            as="p"
            size="12pt"
            weight="semibold"
            color="labelTertiary"
            testId="token-to-sell-info-fiat-value"
          >
            {
              convertAmountAndPriceToNativeDisplay(
                assetToSellValue || 0,
                asset?.price?.value || 0,
                currentCurrency,
              ).display
            }
          </TextOverflow>
        )}
        <Tooltip
          text={`${assetToSellMaxValue.display} ${asset?.symbol}`}
          textColor="labelSecondary"
          textSize="12pt"
          textWeight="medium"
        >
          <Box
            onClick={setAssetToSellMaxValue}
            testId="token-to-sell-info-max-button"
          >
            <ButtonOverflow>
              <Inline alignVertical="center" space="4px">
                <Box marginVertical="-10px">
                  <Symbol
                    symbol="wand.and.stars"
                    size={12}
                    weight="heavy"
                    color="accent"
                  />
                </Box>

                <Text size="12pt" weight="heavy" color="accent">
                  {i18n.t('swap.max')}
                </Text>
              </Inline>
            </ButtonOverflow>
          </Box>
        </Tooltip>
      </Inline>
    </Box>
  );
};
