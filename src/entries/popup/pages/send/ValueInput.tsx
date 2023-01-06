import { AnimationControls, motion } from 'framer-motion';
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
  Symbol,
  Text,
} from '~/design-system';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { SendInputMask } from '../../components/SendInputMask/SendInputMask';

const { innerWidth: windowWidth } = window;

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
  inputAnimationControls,
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
  inputAnimationControls: AnimationControls;
}) => {
  const truncatedAssetSymbol = asset?.symbol?.slice(0, 5) ?? '';

  return (
    <Box paddingBottom="20px" paddingHorizontal="20px">
      <Stack space="16px">
        <Separator color="separatorSecondary" />
        <Box width="full">
          <Rows space="16px">
            <Row>
              <Inline alignVertical="center" alignHorizontal="justify">
                <Box
                  as={motion.div}
                  width="full"
                  animate={inputAnimationControls}
                >
                  <SendInputMask
                    value={`${independentAmount}`}
                    placeholder={`0.00 ${
                      independentField === 'asset'
                        ? truncatedAssetSymbol
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
                        ? truncatedAssetSymbol
                        : currentCurrency
                    }
                  />
                </Box>

                <Box position="absolute" style={{ right: 48 }}>
                  <Button
                    onClick={setMaxAssetAmount}
                    color="accent"
                    height="24px"
                    borderRadius="8px"
                    variant="raised"
                    testId="value-input-max"
                  >
                    {i18n.t('send.max')}
                  </Button>
                </Box>
              </Inline>
            </Row>

            <Row height="content">
              <Inline alignHorizontal="justify" alignVertical="center">
                <TextOverflow
                  maxWidth={windowWidth / 2}
                  size="11pt"
                  weight="bold"
                  color={`${asset ? 'label' : 'labelTertiary'}`}
                >
                  {dependentAmount.display}
                </TextOverflow>
                <Box
                  testId="value-input-switch"
                  onClick={switchIndependentField}
                >
                  <Inline alignVertical="center" space="4px">
                    <Symbol
                      color="accent"
                      size={14}
                      weight="bold"
                      symbol="arrow.up.arrow.down"
                    />
                    <Text color="accent" size="12pt" weight="bold">
                      {i18n.t('send.switch_to', {
                        currency:
                          independentField === 'asset'
                            ? currentCurrency
                            : asset?.symbol,
                      })}
                    </Text>
                  </Inline>
                </Box>
              </Inline>
            </Row>
          </Rows>
        </Box>
      </Stack>
    </Box>
  );
};
