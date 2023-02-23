import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Address, Chain, chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { SwitchNetworkMenu } from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';
import { useVirtualizedAssets } from '~/entries/popup/hooks/useVirtualizedAssets';

import { dropdownContainerVariant } from '../../../components/DropdownInputWrapper/DropdownInputWrapper';
import { BottomNetwork } from '../../messages/BottomActions';

import { SwapTokenRow } from './SwapTokenRow';

interface TokenToReceiveDropdownProps {
  asset: ParsedAddressAsset | null;
  assets: ParsedAddressAsset[];
  onSelectAsset: (address: Address) => void;
}

export const TokenToReceiveDropdown = ({
  asset,
  assets,
  onSelectAsset,
}: TokenToReceiveDropdownProps) => {
  const { containerRef, assetsRowVirtualizer } = useVirtualizedAssets({
    assets,
  });
  const [selectedNetwork, setSelectedNetwork] = useState<Chain>(chain.mainnet);

  console.log('token to receive dropdown ', asset?.colors?.primary);
  return (
    <Stack space="8px">
      <Box paddingHorizontal="20px">
        <Inline alignHorizontal="justify">
          <Inline space="4px" alignVertical="center">
            <Symbol
              symbol="network"
              color="labelTertiary"
              weight="semibold"
              size={14}
            />
            <Text size="14pt" weight="semibold" color="labelTertiary">
              {i18n.t('swap.tokens_input.filter_by_network')}
            </Text>
          </Inline>
          <SwitchNetworkMenu
            accentColor={asset?.colors?.primary || asset?.colors?.fallback}
            type="dropdown"
            chainId={selectedNetwork.id}
            onChainChanged={(_, chain) => setSelectedNetwork(chain)}
            triggerComponent={
              <BottomNetwork selectedNetwork={selectedNetwork} displaySymbol />
            }
          />
        </Inline>
      </Box>
      <Box
        as={motion.div}
        variants={dropdownContainerVariant}
        initial="hidden"
        animate="show"
        ref={containerRef}
      >
        {!!assets?.length &&
          assetsRowVirtualizer?.getVirtualItems().map((virtualItem, i) => {
            const { index } = virtualItem;
            const rowData = assets?.[index];
            return (
              <Box
                paddingHorizontal="8px"
                key={`${rowData?.uniqueId}-${i}`}
                onClick={() => onSelectAsset(rowData.address)}
                testId={`token-input-asset-${asset?.uniqueId}`}
              >
                <SwapTokenRow uniqueId={rowData?.uniqueId} />
              </Box>
            );
          })}
        {!assets.length && (
          <Box alignItems="center" style={{ paddingTop: 119 }}>
            <Stack space="16px">
              <Inline alignHorizontal="center">
                <Symbol
                  color="labelQuaternary"
                  weight="semibold"
                  symbol="record.circle.fill"
                  size={26}
                />
              </Inline>

              <Text
                color="labelQuaternary"
                size="20pt"
                weight="semibold"
                align="center"
              >
                {i18n.t('send.tokens_input.no_tokens')}
              </Text>
            </Stack>
          </Box>
        )}
      </Box>
    </Stack>
  );
};
