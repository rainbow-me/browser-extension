import React from 'react';

import { i18n } from '~/core/languages';
import { SupportedCurrencyKey, supportedCurrencies } from '~/core/references';
import { ParsedAddressAsset } from '~/core/types/assets';
import {
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';

import { InputMask } from '../../components/InputMask/InputMask';

export const ValueInput = ({
  asset,
  currentCurrency,
  dependentAmount,
  independentAmount,
  independentField,
  independentFieldRef,
  setIndependentAmount,
  setMaxAssetAmount,
  switchIndependentField,
}: {
  asset: ParsedAddressAsset;
  currentCurrency: SupportedCurrencyKey;
  dependentAmount: {
    amount: string;
    display: string;
  };
  independentAmount: string;
  independentField: 'asset' | 'native';
  independentFieldRef: React.RefObject<HTMLInputElement>;
  setIndependentAmount: React.Dispatch<React.SetStateAction<string>>;
  setMaxAssetAmount: () => void;
  switchIndependentField: () => void;
}) => {
  const { innerWidth: windowWidth } = window;
  return (
    <Box paddingBottom="20px" paddingHorizontal="20px">
      <Stack space="16px">
        <Separator color="separatorSecondary" />
        <Box width="full">
          <Rows space="16px">
            <Row>
              <Inline alignVertical="center" alignHorizontal="justify">
                <InputMask
                  value={`${independentAmount}`}
                  placeholder={`0.00 ${
                    independentField === 'asset'
                      ? asset?.symbol
                      : currentCurrency
                  }`}
                  decimals={
                    independentField === 'asset'
                      ? asset?.decimals
                      : supportedCurrencies[currentCurrency].decimals
                  }
                  borderColor="accent"
                  onChange={setIndependentAmount}
                  height="56px"
                  variant="bordered"
                  innerRef={independentFieldRef}
                  placeholderSymbol={
                    independentField === 'asset'
                      ? asset?.symbol
                      : currentCurrency
                  }
                />
                <Box position="absolute" style={{ right: 48 }}>
                  <Button
                    onClick={setMaxAssetAmount}
                    color="accent"
                    height="32px"
                    variant="raised"
                  >
                    {i18n.t('send.max')}
                  </Button>
                </Box>
              </Inline>
            </Row>

            <Row height="content">
              <Inline alignHorizontal="justify" alignVertical="center">
                <Box
                  style={{
                    maxWidth: windowWidth / 2,
                  }}
                >
                  <Text
                    size="11pt"
                    weight="bold"
                    color={`${asset ? 'label' : 'labelTertiary'}`}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    <Box
                      paddingVertical="2px"
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {dependentAmount.display}
                    </Box>
                  </Text>
                </Box>
                <Box onClick={switchIndependentField}>
                  <Text color="accent" size="12pt" weight="bold">
                    {i18n.t('send.switch_to')}{' '}
                    {independentField === 'asset'
                      ? currentCurrency
                      : asset?.symbol}
                  </Text>
                </Box>
              </Inline>
            </Row>
          </Rows>
        </Box>
      </Stack>
    </Box>
  );
};
