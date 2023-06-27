import React, { useCallback, useState } from 'react';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { convertAmountAndPriceToNativeDisplay } from '~/core/utils/numbers';
import {
  Bleed,
  Box,
  Column,
  Columns,
  Inline,
  Symbol,
  Text,
  textStyles,
} from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { maskInput } from '~/entries/popup/components/InputMask/utils';
import { Tooltip } from '~/entries/popup/components/Tooltip/Tooltip';

export const TokenToSellInfo = ({
  asset,
  assetToSellValue,
  assetToSellMaxValue,
  assetToSellNativeValue,
  setAssetToSellMaxValue,
  setAssetToSellInputNativeValue,
}: {
  asset: ParsedSearchAsset | null;
  assetToSellValue: string;
  assetToSellMaxValue: { display: string; amount: string };
  setAssetToSellMaxValue: () => void;
  assetToSellNativeValue: { amount: string; display: string } | null;
  setAssetToSellInputNativeValue: (value: string) => void;
}) => {
  const [nativeValue, setNativeValue] = useState('');
  const { currentCurrency } = useCurrentCurrencyStore();

  const handleNativeValueOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = maskInput({
        inputValue: e.target.value,
        decimals: supportedCurrencies[currentCurrency].decimals,
      });
      setNativeValue(maskedValue);
      setAssetToSellInputNativeValue(maskedValue);
    },
    [currentCurrency, setAssetToSellInputNativeValue],
  );

  if (!asset) return null;
  return (
    <Box width="full">
      <Columns alignHorizontal="justify" alignVertical="center">
        {asset && (
          <Column>
            <Inline alignVertical="center">
              <Text
                size="12pt"
                weight="semibold"
                color="labelTertiary"
                testId="token-to-sell-info-fiat-value"
              >
                {supportedCurrencies[currentCurrency].symbol}
              </Text>
              {/* <TextOverflow
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
              </TextOverflow> */}
              <Bleed vertical="4px">
                <Box
                  as="input"
                  type="text"
                  value={nativeValue}
                  onChange={handleNativeValueOnChange}
                  placeholder={
                    assetToSellNativeValue?.display ??
                    convertAmountAndPriceToNativeDisplay(
                      assetToSellValue || 0,
                      asset?.price?.value || 0,
                      currentCurrency,
                    ).amount
                  }
                  className={[
                    textStyles({
                      color: 'labelTertiary',
                      fontSize: '12pt',
                      fontWeight: 'semibold',
                      fontFamily: 'rounded',
                    }),
                  ]}
                />
              </Bleed>
            </Inline>
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
