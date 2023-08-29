import React, { useCallback, useMemo } from 'react';

import { i18n } from '~/core/languages';
import { supportedCurrencies } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
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
import { useBrowser } from '~/entries/popup/hooks/useBrowser';

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
  setIndependentField: (field: IndependentField) => void;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const { isFirefox } = useBrowser();

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

  const nativeFieldValue = useMemo(
    () =>
      independentField === 'sellNativeField'
        ? assetToSellNativeValue
        : assetToSellNativeDisplay?.amount,
    [
      assetToSellNativeDisplay?.amount,
      independentField,
      assetToSellNativeValue,
    ],
  );

  const onFocus = useCallback(() => {
    setAssetToSellInputNativeValue(nativeFieldValue ?? '');
    setIndependentField('sellNativeField');
  }, [nativeFieldValue, setAssetToSellInputNativeValue, setIndependentField]);

  if (!asset) return null;
  return (
    <Box width="full">
      <Columns alignHorizontal="justify" alignVertical="center">
        {asset && (
          <Column>
            <Inline alignVertical="center" wrap={!isFirefox}>
              <Text
                size="12pt"
                weight="semibold"
                color="labelTertiary"
                testId="token-to-sell-info-fiat-value-symbol"
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
                  onFocus={onFocus}
                  disabled={!asset?.native?.price?.amount}
                  testId="token-to-sell-info-fiat-value-input"
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
              marginLeft={isFirefox ? '-36px' : undefined}
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
