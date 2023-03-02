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

import { TokenToBuyInput } from './SwapTokenInput/TokenToBuyInput';
import { TokenToSellInput } from './SwapTokenInput/TokenToSellInput';

export function Swap() {
  const {
    assetsToSell,
    assetToSellFilter,
    assetsToBuy,
    assetToBuyFilter,
    sortMethod,
    assetToBuy,
    assetToSell,
    outputChainId,
    setSortMethod,
    setOutputChainId,
    setAssetToSell,
    setAssetToBuy,
    setAssetToSellFilter,
    setAssetToBuyFilter,
  } = useSwapAssets();

  const {
    assetToSellInputRef,
    assetToReceieveInputRef,
    assetToSellMaxValue,
    assetToBuyValue,
    assetToSellValue,
    assetToSellDropdownClosed,
    assetToBuyDropdownClosed,
    independentField,
    flipAssets,
    onAssetToSellInputOpen,
    onAssetToBuyInputOpen,
    setAssetToSellMaxValue,
    setAssetToSellValue,
    setAssetToBuyValue,
  } = useSwapInputs({
    assetToSell,
    assetToBuy,
    setAssetToSell,
    setAssetToBuy,
  });

  const { data: quote } = useSwapQuotes({
    assetToSell,
    assetToBuy,
    assetToSellValue,
    assetToBuyValue,
    independentField,
  });

  console.log('quote', quote);

  const { toSellInputHeight, toBuyInputHeight } = useSwapDropdownDimensions({
    assetToSell,
    assetToBuy,
  });

  console.log('assetToBuyDropdownClosed', assetToBuyDropdownClosed);
  console.log('assetToSellDropdownClosed', assetToSellDropdownClosed);

  useEffect(() => {
    if (quote) {
      const { sellAmount, buyAmount } = quote as Quote | CrosschainQuote;
      if (independentField === 'sellField' && assetToBuy) {
        setAssetToBuyValue(
          convertRawAmountToBalance(String(buyAmount), assetToBuy).amount,
        );
      } else if (independentField === 'buyField' && assetToSell) {
        setAssetToSellValue(
          convertRawAmountToBalance(String(sellAmount), assetToSell).amount,
        );
      }
    }
  }, [
    assetToBuy,
    assetToSell,
    independentField,
    quote,
    setAssetToBuyValue,
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
                  assetToBuy?.colors?.primary || assetToBuy?.colors?.fallback
                }
              >
                <TokenToBuyInput
                  dropdownHeight={toBuyInputHeight}
                  asset={assetToBuy}
                  assets={assetsToBuy}
                  selectAsset={setAssetToBuy}
                  onDropdownOpen={onAssetToBuyInputOpen}
                  dropdownClosed={assetToBuyDropdownClosed}
                  zIndex={1}
                  placeholder={i18n.t(
                    'swap.input_token_to_receive_placeholder',
                  )}
                  setOutputChainId={setOutputChainId}
                  outputChainId={outputChainId}
                  assetFilter={assetToBuyFilter}
                  setAssetFilter={setAssetToBuyFilter}
                  assetToBuyValue={assetToBuyValue}
                  setAssetToBuyValue={setAssetToBuyValue}
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
