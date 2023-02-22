import React, { useCallback, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { Box, ButtonSymbol, Inline, Stack } from '~/design-system';

import { ChevronDown } from '../../components/ChevronDown/ChevronDown';
import { Navbar } from '../../components/Navbar/Navbar';
import { useSendTransactionAsset } from '../../hooks/send/useSendTransactionAsset';
import { TokenInput } from '../send/TokenInput';

export function Swap() {
  const [toAddressDropdownOpen] = useState(false);

  const { asset, selectAssetAddress, assets, setSortMethod, sortMethod } =
    useSendTransactionAsset();

  const selectAsset = useCallback(
    (address: Address | '') => {
      selectAssetAddress(address);
      // setIndependentAmount('');
    },
    [selectAssetAddress],
  );

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
          <TokenInput
            asset={asset}
            assets={assets}
            selectAssetAddress={selectAsset}
            dropdownClosed={toAddressDropdownOpen}
            setSortMethod={setSortMethod}
            sortMethod={sortMethod}
            zIndex={2}
          />
          <Box
            boxShadow="12px surfaceSecondaryElevated"
            background="surfaceSecondaryElevated"
            borderRadius="32px"
            borderWidth={'1px'}
            borderColor="buttonStroke"
            style={{ width: 42, height: 32, zIndex: 10 }}
            marginTop="-50px"
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
          <TokenInput
            asset={asset}
            assets={assets}
            selectAssetAddress={selectAsset}
            dropdownClosed={toAddressDropdownOpen}
            setSortMethod={setSortMethod}
            sortMethod={sortMethod}
            zIndex={1}
          />
        </Stack>
      </Box>
    </>
  );
}
