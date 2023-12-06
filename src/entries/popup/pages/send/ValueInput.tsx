import { AnimationControls, motion } from 'framer-motion';
import React, { useImperativeHandle, useMemo } from 'react';

import { i18n } from '~/core/languages';
import { SupportedCurrencyKey, supportedCurrencies } from '~/core/references';
import { ParsedUserAsset } from '~/core/types/assets';
import { isCustomChain } from '~/core/utils/chains';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
} from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { SendInputMask } from '../../components/InputMask/SendInputMask/SendInputMask';

interface InputAPI {
  blur: () => void;
  focus: () => void;
  isFocused?: () => boolean;
}

interface ValueInputProps {
  asset: ParsedUserAsset;
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
}

export const ValueInput = React.forwardRef<InputAPI, ValueInputProps>(
  function ValueInput(
    {
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
    }: ValueInputProps,
    forwardedRef,
  ) {
    const truncatedAssetSymbol = asset?.symbol?.slice(0, 5) ?? '';

    useImperativeHandle(forwardedRef, () => ({
      blur: () => independentFieldRef.current?.blur(),
      focus: () => independentFieldRef.current?.focus(),
      isFocused: () => independentFieldRef.current === document.activeElement,
    }));

    const isCustomNetworkAsset = useMemo(
      () => isCustomChain(asset.chainId),
      [asset],
    );

    const isNativeCurrencySupportedForThisAsset = useMemo(() => {
      return (
        !isCustomNetworkAsset ||
        (isCustomNetworkAsset && asset?.native?.balance?.amount != '0')
      );
    }, [isCustomNetworkAsset, asset]);

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
                      tabIndex={0}
                    >
                      {i18n.t('send.max')}
                    </Button>
                  </Box>
                </Inline>
              </Row>

              <Row height="content">
                <Columns alignHorizontal="justify" alignVertical="center">
                  <Column>
                    <TextOverflow
                      as="p"
                      size="11pt"
                      weight="bold"
                      color={`${asset ? 'label' : 'labelTertiary'}`}
                    >
                      {!isNativeCurrencySupportedForThisAsset
                        ? i18n.t('token_details.not_available')
                        : dependentAmount.display}
                    </TextOverflow>
                  </Column>
                  <Column width="content">
                    {isNativeCurrencySupportedForThisAsset && (
                      <Lens
                        testId="value-input-switch"
                        onClick={switchIndependentField}
                        alignItems="flex-end"
                      >
                        <Inline alignVertical="center" space="4px">
                          <Symbol
                            color="accent"
                            size={14}
                            weight="bold"
                            symbol="arrow.up.arrow.down"
                          />
                          <TextOverflow
                            color="accent"
                            size="12pt"
                            weight="bold"
                          >
                            {i18n.t('send.switch_to', {
                              currency:
                                independentField === 'asset'
                                  ? currentCurrency
                                  : asset?.symbol,
                            })}
                          </TextOverflow>
                        </Inline>
                      </Lens>
                    )}
                  </Column>
                </Columns>
              </Row>
            </Rows>
          </Box>
        </Stack>
      </Box>
    );
  },
);
