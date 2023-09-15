import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import React, { useContext, useMemo, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isL2Chain } from '~/core/utils/chains';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { SwitchNetworkMenu } from '~/entries/popup/components/SwitchMenu/SwitchNetworkMenu';
import { CursorTooltip } from '~/entries/popup/components/Tooltip/CursorTooltip';
import { AssetToBuySection } from '~/entries/popup/hooks/useSearchCurrencyLists';

import {
  DropdownScrollContext,
  dropdownContainerVariant,
} from '../../../../components/DropdownInputWrapper/DropdownInputWrapper';
import { BottomNetwork } from '../../../messages/BottomActions';

import { TokenToBuySection } from './TokenToBuySection';

export type TokenToBuyDropdownProps = {
  asset: ParsedSearchAsset | null;
  assets?: AssetToBuySection[];
  outputChainId: ChainId;
  onSelectAsset?: (asset: ParsedSearchAsset | null) => void;
  setOutputChainId: (chainId: ChainId) => void;
  onDropdownChange: (open: boolean) => void;
};

export const TokenToBuyDropdown = ({
  asset,
  assets,
  outputChainId,
  onSelectAsset,
  setOutputChainId,
  onDropdownChange,
}: TokenToBuyDropdownProps) => {
  const dropdownScrollRef = useContext(DropdownScrollContext);
  const [tooltipOffset, setTooltipOffset] = useState(0);
  const isL2 = useMemo(() => isL2Chain(outputChainId), [outputChainId]);

  const { scrollY } = useScroll({
    container: dropdownScrollRef,
    layoutEffect: false,
  });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setTooltipOffset(latest);
  });

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
            onOpenChange={onDropdownChange}
            marginRight="20px"
            accentColor={asset?.colors?.primary || asset?.colors?.fallback}
            type="dropdown"
            chainId={outputChainId}
            onChainChanged={(chainId) => {
              setOutputChainId(chainId);
            }}
            triggerComponent={
              <CursorTooltip
                align="start"
                arrowAlignment="center"
                text={i18n.t('tooltip.switch_network')}
                textWeight="bold"
                textSize="12pt"
                textColor="labelSecondary"
                marginLeft="-18px"
                hint={shortcuts.home.SWITCH_NETWORK.display}
              >
                <ButtonOverflow testId="token-to-buy-networks-trigger">
                  <BottomNetwork
                    selectedChainId={outputChainId}
                    displaySymbol
                    symbolSize={12}
                    symbol="chevron.down"
                  />
                </ButtonOverflow>
              </CursorTooltip>
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
            <TokenToBuySection
              key={i}
              assetSection={assetSection}
              onSelectAsset={onSelectAsset}
              onDropdownChange={onDropdownChange}
              outputChainId={outputChainId}
              tooltipOffset={tooltipOffset}
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
