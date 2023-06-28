import React, { useCallback, useMemo } from 'react';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { handleSignificantDecimals } from '~/core/utils/numbers';
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
import { placeholderStyle } from '~/design-system/components/Input/Input.css';
import { maskInput } from '~/entries/popup/components/InputMask/utils';
import { Tooltip } from '~/entries/popup/components/Tooltip/Tooltip';
import { IndependentField } from '~/entries/popup/hooks/swap/useSwapInputs';

export const TokenToSellInfo = ({
  asset,
  assetToSellMaxValue,
  assetToSellNativeValue,
  assetToSellNativeDisplay,
  independentField,
  setAssetToSellMaxValue,
  setAssetToSellInputNativeValue,
  setIndependentField,
}: {
  asset: ParsedSearchAsset | null;
  assetToSellMaxValue: { display: string; amount: string };
  assetToSellNativeValue: string;
  assetToSellNativeDisplay: { amount: string; display: string } | null;
  independentField: IndependentField;
  setAssetToSellMaxValue: () => void;
  setAssetToSellInputNativeValue: (value: string) => void;
  setIndependentField: React.Dispatch<React.SetStateAction<IndependentField>>;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();

  const handleNativeValueOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = maskInput({
        inputValue: e.target.value,
        decimals: supportedCurrencies[currentCurrency].decimals,
      });
      setAssetToSellInputNativeValue(maskedValue);
    },
    [currentCurrency, setAssetToSellInputNativeValue],
  );

  const nativeFieldValue = useMemo(() => {
    if (independentField === 'sellNativeField') {
      return assetToSellNativeValue;
    }
    return assetToSellNativeDisplay?.amount
      ? handleSignificantDecimals(
          assetToSellNativeDisplay?.amount,
          supportedCurrencies[currentCurrency].decimals,
        )
      : undefined;
  }, [
    assetToSellNativeDisplay?.amount,
    currentCurrency,
    independentField,
    assetToSellNativeValue,
  ]);

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
              <Bleed vertical="4px">
                <Box
                  as="input"
                  type="text"
                  value={nativeFieldValue || ''}
                  onChange={handleNativeValueOnChange}
                  placeholder={supportedCurrencies[currentCurrency].placeholder}
                  className={[
                    placeholderStyle,
                    textStyles({
                      color: 'labelTertiary',
                      fontSize: '12pt',
                      fontWeight: 'semibold',
                      fontFamily: 'rounded',
                    }),
                  ]}
                  onFocus={() => setIndependentField('sellNativeField')}
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
