import { motion } from 'framer-motion';
import React, { useCallback } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, ButtonSymbol, Inline, Stack } from '~/design-system';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { ChevronDown } from '../../components/ChevronDown/ChevronDown';
import { Navbar } from '../../components/Navbar/Navbar';
import { useSendTransactionAsset } from '../../hooks/send/useSendTransactionAsset';
import { useSwapInputs } from '../../hooks/swap/useSwapInputs';

import { SwapTokenInput } from './SwapTokenInput';

export function Swap() {
  const { tokenToReceiveDropdownVisible, tokenToSwapDropdownVisible } =
    useSwapInputs();

  const { asset, selectAssetAddress, assets, setSortMethod, sortMethod } =
    useSendTransactionAsset();

  const selectAsset = useCallback(
    (address: Address | '') => {
      selectAssetAddress(address);
      // setIndependentAmount('');
    },
    [selectAssetAddress],
  );

  const onFlip = useCallback(() => null, []);

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
        <Stack space="8px">
          <SwapTokenInput
            asset={asset}
            assets={assets}
            selectAssetAddress={selectAsset}
            dropdownClosed={tokenToSwapDropdownVisible}
            setSortMethod={setSortMethod}
            sortMethod={sortMethod}
            zIndex={2}
          />
          <Box marginVertical="-20px" style={{ zIndex: 3 }}>
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
                onClick={onFlip}
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

          <SwapTokenInput
            asset={asset}
            assets={assets}
            selectAssetAddress={selectAsset}
            dropdownClosed={tokenToReceiveDropdownVisible}
            setSortMethod={setSortMethod}
            sortMethod={sortMethod}
            zIndex={1}
          />
        </Stack>
      </Box>
    </>
  );
}
