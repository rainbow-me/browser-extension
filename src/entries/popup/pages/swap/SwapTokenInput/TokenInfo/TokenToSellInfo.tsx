import React from 'react';

import { i18n } from '~/core/languages';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { convertAmountAndPriceToNativeDisplay } from '~/core/utils/numbers';
import {
  Box,
  Column,
  Columns,
  Inline,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { Tooltip } from '~/entries/popup/components/Tooltip/Tooltip';

export const TokenToSellInfo = ({
  asset,
  assetToSellValue,
  assetToSellMaxValue,
  assetToSellNativeValue,
  setAssetToSellMaxValue,
}: {
  asset: ParsedSearchAsset | null;
  assetToSellValue: string;
  assetToSellMaxValue: { display: string; amount: string };
  setAssetToSellMaxValue: () => void;
  assetToSellNativeValue: { amount: string; display: string } | null;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();

  if (!asset) return null;
  return (
    <Box width="full">
      <Columns alignHorizontal="justify">
        {asset && (
          <Column>
            <TextOverflow
              as="p"
              size="12pt"
              weight="semibold"
              color="labelTertiary"
              testId="token-to-sell-info-fiat-value"
            >
              {assetToSellNativeValue?.display ??
                convertAmountAndPriceToNativeDisplay(
                  assetToSellValue || 0,
                  asset?.price?.value || 0,
                  currentCurrency,
                ).display}
            </TextOverflow>
          </Column>
        )}
        <Column width="content">
          <Tooltip
            text={`${assetToSellMaxValue.display} ${asset?.symbol}`}
            textColor="labelSecondary"
            textSize="12pt"
            textWeight="medium"
            arrowAlignment="right"
            align="end"
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
        </Column>
      </Columns>
    </Box>
  );
};
