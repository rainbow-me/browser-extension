import { motion } from 'framer-motion';
import React from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset, ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';
import { SwitchNetworkMenu } from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';
import { useVirtualizedAssets } from '~/entries/popup/hooks/useVirtualizedAssets';

import { dropdownContainerVariant } from '../../../../components/DropdownInputWrapper/DropdownInputWrapper';
import { BottomNetwork } from '../../../messages/BottomActions';
import { TokenToReceiveRow } from '../TokenRow/TokenToReceiveRow';

export type TokenToReceiveDropdownProps = {
  asset: ParsedAddressAsset | null;
  assets?: ParsedAsset[];
  outputChainId: ChainId;
  onSelectAsset?: (address: Address) => void;
  setOutputChainId: (chainId: ChainId) => void;
};

export const TokenToReceiveDropdown = ({
  asset,
  assets,
  outputChainId,
  onSelectAsset,
  setOutputChainId,
}: TokenToReceiveDropdownProps) => {
  const { containerRef, assetsRowVirtualizer } = useVirtualizedAssets({
    assets,
    size: 10,
  });

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
            marginRight="20px"
            accentColor={asset?.colors?.primary || asset?.colors?.fallback}
            type="dropdown"
            chainId={outputChainId}
            onChainChanged={(chainId) => {
              setOutputChainId(chainId);
            }}
            triggerComponent={
              <Box
                as={motion.div}
                initial={{ zIndex: 0 }}
                whileHover={{
                  scale: transformScales['1.04'],
                }}
                whileTap={{
                  scale: transformScales['0.96'],
                }}
                transition={transitions.bounce}
              >
                <BottomNetwork
                  selectedChainId={outputChainId}
                  displaySymbol
                  symbolSize={12}
                  symbol="chevron.down"
                />
              </Box>
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
                onClick={() =>
                  onSelectAsset?.(rowData.mainnetAddress || rowData.address)
                }
                testId={`token-input-asset-${asset?.uniqueId}`}
              >
                <TokenToReceiveRow asset={rowData} />
              </Box>
            );
          })}
        {!assets?.length && (
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
