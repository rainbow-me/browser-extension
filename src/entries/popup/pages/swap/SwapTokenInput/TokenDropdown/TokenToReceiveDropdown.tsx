import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isL2Chain } from '~/core/utils/chains';
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
  asset?: ParsedAddressAsset;
  assets?: {
    data: ParsedAddressAsset[];
    title: string;
  }[];
  outputChainId: ChainId;
  onSelectAsset?: (address: Address) => void;
  setOutputChainId: (chainId: ChainId) => void;
};

const AssetsToReceiveSection = ({
  data,
  title,
  onSelectAsset,
}: {
  data: ParsedAddressAsset[];
  title: string;
  onSelectAsset?: (address: Address) => void;
}) => {
  const { containerRef, assetsRowVirtualizer } = useVirtualizedAssets({
    assets: data,
    size: 5,
  });

  if (!data.length) return null;
  return (
    <Box ref={containerRef} paddingTop="12px">
      <Box paddingHorizontal="20px">
        <Text
          WebkitBackgroundClip="text"
          background="rainbow"
          size="14pt"
          weight="semibold"
          color="transparent"
        >
          {title}
        </Text>
      </Box>
      <Box paddingTop="16px">
        {assetsRowVirtualizer?.getVirtualItems().map((virtualItem, i) => {
          const { index } = virtualItem;
          const rowData = data?.[index] as ParsedAddressAsset;
          return (
            <Box
              paddingHorizontal="8px"
              key={`${rowData?.uniqueId}-${i}`}
              onClick={() =>
                onSelectAsset?.(rowData?.mainnetAddress || rowData?.address)
              }
              testId={`token-input-asset-${rowData?.uniqueId}`}
            >
              <TokenToReceiveRow asset={rowData} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const TokenToReceiveDropdown = ({
  asset,
  assets,
  outputChainId,
  onSelectAsset,
  setOutputChainId,
}: TokenToReceiveDropdownProps) => {
  const isL2 = useMemo(() => isL2Chain(outputChainId), [outputChainId]);

  const assetsCount = useMemo(
    () => assets?.reduce((count, section) => count + section.data.length, 0),
    [assets],
  );
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
      >
        <Stack space="16px">
          {assets?.map((assetSection, i) => (
            <AssetsToReceiveSection
              key={i}
              data={assetSection.data}
              title={assetSection.title}
              onSelectAsset={onSelectAsset}
            />
          ))}
        </Stack>

        {!assetsCount && (
          <Box alignItems="center" style={{ paddingTop: 91 }}>
            <Box paddingHorizontal="44px">
              <Stack space="16px">
                <Text color="label" size="26pt" weight="bold" align="center">
                  {'👻'}
                </Text>

                <Text
                  color="labelTertiary"
                  size="20pt"
                  weight="semibold"
                  align="center"
                >
                  {i18n.t('swap.tokens_input.nothing_found')}
                </Text>

                <Text
                  color="labelQuaternary"
                  size="14pt"
                  weight="regular"
                  align="center"
                >
                  {i18n.t(
                    `swap.tokens_input.${
                      isL2
                        ? 'nothing_found_description_l2'
                        : 'nothing_found_description'
                    }`,
                  )}
                </Text>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>
    </Stack>
  );
};
