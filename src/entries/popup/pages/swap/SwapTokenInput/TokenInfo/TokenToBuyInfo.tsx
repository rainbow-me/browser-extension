import React, { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import {
  abs,
  convertAmountAndPriceToNativeDisplay,
  convertAmountToPercentageDisplay,
  divide,
  handleSignificantDecimals,
  lessThan,
  subtract,
} from '~/core/utils/numbers';
import {
  Box,
  Column,
  Columns,
  Inline,
  Text,
  TextOverflow,
} from '~/design-system';
import { CursorTooltip } from '~/entries/popup/components/Tooltip/CursorTooltip';

export const TokenToBuyInfo = ({
  assetToBuy,
  assetToBuyValue,
  assetToBuyNativeDisplay,
  assetToSellNativeDisplay,
}: {
  assetToBuy: ParsedSearchAsset | null;
  assetToSell: ParsedSearchAsset | null;
  assetToBuyValue?: string;
  assetToSellValue?: string;
  assetToBuyNativeDisplay: { amount: string; display: string } | null;
  assetToSellNativeDisplay: { amount: string; display: string } | null;
}) => {
  /*
   * saw a crash happening sometimes when decimals
   * returned null... this fallback fixed it, but
   * unsure why it was happening to begin with and
   * think my changes in useSwapInputs caused it.
   */

  const assetToBuyDecimals = assetToBuy?.decimals ?? 18;

  const { currentCurrency } = useCurrentCurrencyStore();

  const nativeValueDisplay = useMemo(() => {
    const nativeDisplay = convertAmountAndPriceToNativeDisplay(
      assetToBuyValue || '0',
      assetToBuy?.native?.price?.amount || '0',
      currentCurrency,
    );
    return nativeDisplay.display;
  }, [assetToBuy?.native?.price?.amount, currentCurrency, assetToBuyValue]);

  const nativeValueDifferenceDisplay = useMemo(() => {
    if (
      !assetToSellNativeDisplay?.amount ||
      assetToSellNativeDisplay?.amount === '0' ||
      !assetToBuyNativeDisplay?.amount ||
      assetToBuyNativeDisplay?.amount === '0'
    )
      return null;
    const division = divide(
      subtract(assetToBuyNativeDisplay.amount, assetToSellNativeDisplay.amount),
      assetToBuyNativeDisplay.amount,
    );
    const nativeDifference = convertAmountToPercentageDisplay(
      lessThan(abs(division), 0.01) ? '-0.01' : division,
    );
    return nativeDifference;
  }, [assetToBuyNativeDisplay, assetToSellNativeDisplay]);

  if (!assetToBuy) return null;
  return (
    <Box>
      <Columns alignHorizontal="justify" space="4px">
        <Column>
          <Columns alignVertical="center" space="4px">
            <Column width="content">
              <TextOverflow
                testId={'token-to-buy-info-price'}
                as="p"
                size="12pt"
                weight="semibold"
                color="labelTertiary"
              >
                {assetToBuyNativeDisplay?.display ?? nativeValueDisplay}
              </TextOverflow>
            </Column>

            <Column width="content">
              <CursorTooltip
                text={i18n.t('tooltip.estimated_difference')}
                textColor="labelSecondary"
                textSize="12pt"
                textWeight="bold"
                arrowAlignment="center"
                align="center"
              >
                <Text
                  as="p"
                  size="12pt"
                  weight="medium"
                  color="labelQuaternary"
                >
                  {nativeValueDifferenceDisplay
                    ? `(${nativeValueDifferenceDisplay})`
                    : ''}
                </Text>
              </CursorTooltip>
            </Column>
          </Columns>
        </Column>

        <Column>
          <Inline alignHorizontal="right">
            <Columns alignVertical="center" alignHorizontal="right" space="4px">
              <Column width="content">
                <Text size="12pt" weight="medium" color="labelQuaternary">
                  {`${i18n.t('swap.balance')}:`}
                </Text>
              </Column>

              <Column>
                <Box width="fit">
                  <TextOverflow
                    testId={'token-to-buy-info-balance'}
                    size="12pt"
                    weight="medium"
                    color="labelSecondary"
                  >
                    {assetToBuy?.balance?.amount &&
                      handleSignificantDecimals(
                        assetToBuy?.balance?.amount,
                        assetToBuyDecimals,
                      )}
                  </TextOverflow>
                </Box>
              </Column>
            </Columns>
          </Inline>
        </Column>
      </Columns>
    </Box>
  );
};
