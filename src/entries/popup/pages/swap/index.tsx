import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
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
import { TokenToSwapInput } from './SwapTokenInput/TokenToSwapInput';

export function Swap() {
  const {
    assetsToSwap,
    assetToSwapFilter,
    assetsToReceive,
    assetToReceiveFilter,
    sortMethod,
    assetToReceive,
    assetToSwap,
    outputChainId,
    setSortMethod,
    setOutputChainId,
    setAssetToSwap,
    setAssetToReceive,
    setAssetToSwapFilter,
    setAssetToReceiveFilter,
  } = useSwapAssets();

  const {
    assetToSwapInputRef,
    assetToReceieveInputRef,
    assetToSwapMaxValue,
    assetToReceiveValue,
    assetToSwapValue,
    assetToSwapDropdownClosed,
    assetToReceiveDropdownClosed,
    independentField,
    flipAssets,
    onAssetToSwapInputOpen,
    onAssetToReceiveInputOpen,
    setAssetToSwapMaxValue,
    setAssetToSwapValue,
    setAssetToReceiveValue,
  } = useSwapInputs({
    assetToSwap,
    assetToReceive,
    setAssetToSwap,
    setAssetToReceive,
  });

  const { data } = useSwapQuotes({
    assetToSwap,
    assetToReceive,
    assetToSwapValue,
    assetToReceiveValue,
    independentField,
  });

  console.log('data', data);

  const { toSwapInputHeight, toReceiveInputHeight } = useSwapDropdownDimensions(
    { assetToSwap, assetToReceive },
  );

  console.log('assetToReceiveDropdownClosed', assetToReceiveDropdownClosed);
  console.log('assetToSwapDropdownClosed', assetToSwapDropdownClosed);

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
                  assetToSwap?.colors?.primary || assetToSwap?.colors?.fallback
                }
              >
                <TokenToSwapInput
                  dropdownHeight={toSwapInputHeight}
                  asset={assetToSwap}
                  assets={assetsToSwap}
                  selectAsset={setAssetToSwap}
                  onDropdownOpen={onAssetToSwapInputOpen}
                  dropdownClosed={assetToSwapDropdownClosed}
                  setSortMethod={setSortMethod}
                  assetFilter={assetToSwapFilter}
                  setAssetFilter={setAssetToSwapFilter}
                  sortMethod={sortMethod}
                  zIndex={2}
                  placeholder={i18n.t('swap.input_token_to_swap_placeholder')}
                  assetToSwapMaxValue={assetToSwapMaxValue}
                  setAssetToSwapMaxValue={setAssetToSwapMaxValue}
                  assetToSwapValue={assetToSwapValue}
                  setAssetToSwapValue={setAssetToSwapValue}
                  inputRef={assetToSwapInputRef}
                />
              </AccentColorProviderWrapper>

              <Box
                marginVertical="-20px"
                style={{ zIndex: assetToSwapDropdownClosed ? 3 : 1 }}
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
