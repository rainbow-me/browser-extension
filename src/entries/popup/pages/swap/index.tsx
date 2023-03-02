import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { motion } from 'framer-motion';
import React, { useEffect } from 'react';

import { i18n } from '~/core/languages';
import { convertRawAmountToBalance } from '~/core/utils/numbers';
import {
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Row,
  Rows,
  Stack,
  Text,
} from '~/design-system';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { ChevronDown } from '../../components/ChevronDown/ChevronDown';
import { Navbar } from '../../components/Navbar/Navbar';
import { useSwapAssets } from '../../hooks/swap/useSwapAssets';
import { useSwapDropdownDimensions } from '../../hooks/swap/useSwapDropdownDimensions';
import { useSwapInputs } from '../../hooks/swap/useSwapInputs';
import { useSwapQuotes } from '../../hooks/swap/useSwapQuotes';

import { TokenToReceiveInput } from './SwapTokenInput/TokenToReceiveInput';
import { TokenToSellInput } from './SwapTokenInput/TokenToSellInput';

export function Swap() {
  const {
    assetsToSell,
    assetToSellFilter,
    assetsToReceive,
    assetToReceiveFilter,
    sortMethod,
    assetToReceive,
    assetToSell,
    outputChainId,
    setSortMethod,
    setOutputChainId,
    setAssetToSell,
    setAssetToReceive,
    setAssetToSellFilter,
    setAssetToReceiveFilter,
  } = useSwapAssets();

  const {
    assetToSellInputRef,
    assetToReceieveInputRef,
    assetToSellMaxValue,
    assetToReceiveValue,
    assetToSellValue,
    assetToSellDropdownClosed,
    assetToReceiveDropdownClosed,
    independentField,
    flipAssets,
    onAssetToSellInputOpen,
    onAssetToReceiveInputOpen,
    setAssetToSellMaxValue,
    setAssetToSellValue,
    setAssetToReceiveValue,
  } = useSwapInputs({
    assetToSell,
    assetToReceive,
    setAssetToSell,
    setAssetToReceive,
  });

  const { data: quote } = useSwapQuotes({
    assetToSell,
    assetToReceive,
    assetToSellValue,
    assetToReceiveValue,
    independentField,
  });

  console.log('quote', quote);

  const { toSellInputHeight, toReceiveInputHeight } = useSwapDropdownDimensions(
    { assetToSell, assetToReceive },
  );

  console.log('assetToReceiveDropdownClosed', assetToReceiveDropdownClosed);
  console.log('assetToSellDropdownClosed', assetToSellDropdownClosed);

  useEffect(() => {
    if (quote) {
      const { sellAmount, buyAmount } = quote as Quote | CrosschainQuote;
      if (independentField === 'toSell' && assetToReceive) {
        setAssetToReceiveValue(
          convertRawAmountToBalance(String(buyAmount), assetToReceive).amount,
        );
      } else if (independentField === 'toReceive' && assetToSell) {
        setAssetToSellValue(
          convertRawAmountToBalance(String(sellAmount), assetToSell).amount,
        );
      }
    }
  }, [
    assetToReceive,
    assetToSell,
    independentField,
    quote,
    setAssetToReceiveValue,
    setAssetToSellValue,
  ]);

  return (
    <>
      <Navbar
        title={i18n.t('swap.title')}
        background={'surfaceSecondary'}
        leftComponent={<Navbar.CloseButton />}
        rightComponent={
          <ButtonSymbol
            color="surfaceSecondaryElevated"
            height={'32px'}
            onClick={() => null}
            symbol="switch.2"
            symbolColor="labelSecondary"
            variant="flat"
          />
        }
      />
      <Box
        background="surfaceSecondary"
        style={{ height: 535 }}
        paddingBottom="20px"
        paddingHorizontal="12px"
      >
        <Rows alignVertical="justify">
          <Row height="content">
            <Stack space="8px">
              <AccentColorProviderWrapper
                color={
                  assetToSell?.colors?.primary || assetToSell?.colors?.fallback
                }
              >
                <TokenToSellInput
                  dropdownHeight={toSellInputHeight}
                  asset={assetToSell}
                  assets={assetsToSell}
                  selectAsset={setAssetToSell}
                  onDropdownOpen={onAssetToSellInputOpen}
                  dropdownClosed={assetToSellDropdownClosed}
                  setSortMethod={setSortMethod}
                  assetFilter={assetToSellFilter}
                  setAssetFilter={setAssetToSellFilter}
                  sortMethod={sortMethod}
                  zIndex={2}
                  placeholder={i18n.t('swap.input_token_to_swap_placeholder')}
                  assetToSellMaxValue={assetToSellMaxValue}
                  setAssetToSellMaxValue={setAssetToSellMaxValue}
                  assetToSellValue={assetToSellValue}
                  setAssetToSellValue={setAssetToSellValue}
                  inputRef={assetToSellInputRef}
                />
              </AccentColorProviderWrapper>

              <Box
                marginVertical="-20px"
                style={{ zIndex: assetToSellDropdownClosed ? 3 : 1 }}
              >
                <Inline alignHorizontal="center">
                  <Box
                    as={motion.div}
                    initial={{ zIndex: 0 }}
                    whileHover={{ scale: transformScales['1.04'] }}
                    whileTap={{ scale: transformScales['0.96'] }}
                    transition={transitions.bounce}
                    boxShadow="12px surfaceSecondaryElevated"
                    background="surfaceSecondaryElevated"
                    borderRadius="32px"
                    borderWidth={'1px'}
                    borderColor="buttonStroke"
                    style={{ width: 42, height: 32, zIndex: 10 }}
                    onClick={flipAssets}
                  >
                    <Box width="full" height="full" alignItems="center">
                      <Inline
                        height="full"
                        alignHorizontal="center"
                        alignVertical="center"
                      >
                        <Stack alignHorizontal="center">
                          <Box marginBottom="-4px">
                            <ChevronDown color="labelTertiary" />
                          </Box>
                          <Box marginTop="-4px">
                            <ChevronDown color="labelQuaternary" />
                          </Box>
                        </Stack>
                      </Inline>
                    </Box>
                  </Box>
                </Inline>
              </Box>

              <AccentColorProviderWrapper
                color={
                  assetToReceive?.colors?.primary ||
                  assetToReceive?.colors?.fallback
                }
              >
                <TokenToReceiveInput
                  dropdownHeight={toReceiveInputHeight}
                  asset={assetToReceive}
                  assets={assetsToReceive}
                  selectAsset={setAssetToReceive}
                  onDropdownOpen={onAssetToReceiveInputOpen}
                  dropdownClosed={assetToReceiveDropdownClosed}
                  zIndex={1}
                  placeholder={i18n.t(
                    'swap.input_token_to_receive_placeholder',
                  )}
                  setOutputChainId={setOutputChainId}
                  outputChainId={outputChainId}
                  assetFilter={assetToReceiveFilter}
                  setAssetFilter={setAssetToReceiveFilter}
                  assetToReceiveValue={assetToReceiveValue}
                  setAssetToReceiveValue={setAssetToReceiveValue}
                  inputRef={assetToReceieveInputRef}
                />
              </AccentColorProviderWrapper>
            </Stack>
          </Row>
          <Row height="content">
            <Box paddingHorizontal="8px">
              <Button
                height="44px"
                variant="flat"
                color="surfaceSecondary"
                width="full"
                disabled
              >
                <Text color="labelQuaternary" size="14pt" weight="bold">
                  {i18n.t('swap.select_tokens_to_swap')}
                </Text>
              </Button>
            </Box>
          </Row>
        </Rows>
      </Box>
    </>
  );
}
