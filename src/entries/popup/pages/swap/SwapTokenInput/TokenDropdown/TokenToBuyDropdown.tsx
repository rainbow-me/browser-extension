import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { useCallback, useMemo, useRef } from 'react';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { SwitchNetworkMenu } from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';
import {
  AssetToBuyNetworkSearchStatus,
  AssetToBuySection,
} from '~/entries/popup/hooks/useSearchCurrencyLists';
import { useTranslationContext } from '~/entries/popup/hooks/useTranslationContext';

import { dropdownContainerVariant } from '../../../../components/DropdownInputWrapper/DropdownInputWrapper';
import { BottomNetwork } from '../../../messages/BottomActions';

import { getTokenToBuySectionElements } from './TokenToBuySection';

export type TokenToBuyDropdownProps = {
  asset: ParsedSearchAsset | null;
  assets?: AssetToBuySection[];
  outputChainId?: ChainId;
  networkSearchStatus: AssetToBuyNetworkSearchStatus;
  onSelectAsset?: (asset: ParsedSearchAsset | null) => void;
  setOutputChainId?: (chainId: ChainId) => void;
  onDropdownChange: (open: boolean) => void;
};

export const TokenToBuyDropdown = ({
  asset,
  assets,
  outputChainId,
  networkSearchStatus,
  onSelectAsset,
  setOutputChainId,
  onDropdownChange,
}: TokenToBuyDropdownProps) => {
  const isL2 = useMemo(
    () => outputChainId && outputChainId !== ChainId.mainnet,
    [outputChainId],
  );

  const assetsCount = useMemo(
    () =>
      assets?.reduce((count, section) => count + section?.data?.length || 0, 0),
    [assets],
  );

  const t = useTranslationContext();

  const containerRef = useRef<HTMLDivElement>(null);

  const allAssets = useMemo(
    () =>
      assets
        ?.map((section) =>
          getTokenToBuySectionElements({
            assetSection: section,
            onSelectAsset,
            onDropdownChange,
            outputChainId,
          }),
        )
        .flat()
        .filter(Boolean),
    [assets, onDropdownChange, onSelectAsset, outputChainId],
  );

  const getSize = useCallback(
    (index: number) => {
      const asset = allAssets?.[index];
      if (asset?.key === 'header') return 38;
      console.log('-- asset', asset);
      return 52;
    },
    [allAssets],
  );
  console.log('-- allAssets', allAssets);

  const assetsRowVirtualizer = useVirtualizer({
    count: allAssets?.length || 0,
    getScrollElement: () => containerRef.current,
    estimateSize: (i) => getSize(i), // Adjust the size as needed
    overscan: 10,
  });

  console.log(
    'assetsRowVirtualizer.getVirtualItems().map((virtualItem, i)',
    assetsRowVirtualizer.getVirtualItems().length,
  );

  return (
    <Stack space="20px">
      {setOutputChainId &&
        outputChainId &&
        networkSearchStatus !== AssetToBuyNetworkSearchStatus.all && (
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
                onOpenChange={onDropdownChange}
                marginRight="20px"
                accentColor={asset?.colors?.primary || asset?.colors?.fallback}
                type="dropdown"
                chainId={outputChainId}
                onChainChanged={(chainId) => {
                  setOutputChainId(chainId);
                }}
                triggerComponent={
                  <ButtonOverflow testId="token-to-buy-networks-trigger">
                    <BottomNetwork
                      selectedChainId={outputChainId}
                      displaySymbol
                      symbolSize={12}
                      symbol="chevron.down"
                    />
                  </ButtonOverflow>
                }
                onlySwapSupportedNetworks
              />
            </Inline>
          </Box>
        )}

      <Box
        as={motion.div}
        variants={dropdownContainerVariant}
        initial="hidden"
        animate="show"
        ref={containerRef}
        style={{
          height: '523px',
          overflow: 'auto',
        }}
      >
        <Box
          style={{
            height: `${assetsRowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {assetsRowVirtualizer.getVirtualItems().map((virtualItem) => {
            const { index, key, size, start } = virtualItem;
            console.log('-- virtualItem', virtualItem);
            const assetSection = allAssets?.[index] as JSX.Element;
            return (
              <Box
                key={key}
                as={motion.div}
                paddingHorizontal="8px"
                //   onClick={() => onSelectAsset(asset)}
                position="absolute"
                width="full"
                style={{
                  height: size,
                  y: start,
                }}
              >
                {assetSection}
              </Box>
            );
          })}
        </Box>

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
                  {t('swap.tokens_input.nothing_found')}
                </Text>

                <Text
                  color="labelQuaternary"
                  size="14pt"
                  weight="regular"
                  align="center"
                >
                  {t(
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
