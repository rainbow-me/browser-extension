import React, { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountToPercentageDisplay,
  divide,
  handleSignificantDecimals,
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

export const TokenToBuyInfo = ({
  assetToBuy,
  assetToBuyValue,
  assetToBuyNativeAmount,
  assetToSellNativeAmount,
}: {
  assetToBuy: ParsedSearchAsset | null;
  assetToSell: ParsedSearchAsset | null;
  assetToBuyValue?: string;
  assetToSellValue?: string;
  assetToBuyNativeAmount: { amount: string; display: string } | null;
  assetToSellNativeAmount: { amount: string; display: string } | null;
}) => {
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
    if (!assetToSellNativeAmount?.amount || !assetToBuyNativeAmount?.amount)
      return null;
    const nativeDifference = convertAmountToPercentageDisplay(
      divide(
        subtract(assetToBuyNativeAmount.amount, assetToSellNativeAmount.amount),
        assetToBuyNativeAmount.amount,
      ),
    );
    return nativeDifference;
  }, [assetToBuyNativeAmount?.amount, assetToSellNativeAmount?.amount]);

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
                {assetToBuyNativeAmount?.display ?? nativeValueDisplay}
              </TextOverflow>
            </Column>

            <Column width="content">
              <Text as="p" size="12pt" weight="medium" color="labelQuaternary">
                {nativeValueDifferenceDisplay
                  ? `(${nativeValueDifferenceDisplay})`
                  : ''}
              </Text>
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
                        assetToBuy?.decimals,
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
