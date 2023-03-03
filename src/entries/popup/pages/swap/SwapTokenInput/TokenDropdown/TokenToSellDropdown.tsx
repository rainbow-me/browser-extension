import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { Bleed, Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { SortMethod } from '~/entries/popup/hooks/send/useSendAsset';
import { useVirtualizedAssets } from '~/entries/popup/hooks/useVirtualizedAssets';

import { dropdownContainerVariant } from '../../../../components/DropdownInputWrapper/DropdownInputWrapper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../../../components/DropdownMenu/DropdownMenu';
import { TokenToSellRow } from '../TokenRow/TokenToSellRow';

export type TokenToSellDropdownProps = {
  asset: ParsedAddressAsset | null;
  assets?: ParsedAddressAsset[];
  sortMethod: SortMethod;
  onSelectAsset?: (asset: ParsedAddressAsset) => void;
  setSortMethod: (sortMethod: SortMethod) => void;
  onDropdownChange: (open: boolean) => void;
};

export const TokenToSellDropdown = ({
  asset,
  assets,
  sortMethod,
  onSelectAsset,
  setSortMethod,
  onDropdownChange,
}: TokenToSellDropdownProps) => {
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
              symbol="record.circle.fill"
              color="labelTertiary"
              weight="semibold"
              size={14}
            />
            <Text size="14pt" weight="semibold" color="labelTertiary">
              {i18n.t('swap.tokens_input.tokens')}
            </Text>
          </Inline>
          <DropdownMenu onOpenChange={onDropdownChange}>
            <DropdownMenuTrigger
              accentColor={asset?.colors?.primary || asset?.colors?.fallback}
              asChild
            >
              <Box>
                <Inline space="4px" alignVertical="center">
                  <Symbol
                    symbol="arrow.up.arrow.down"
                    color="labelTertiary"
                    weight="semibold"
                    size={14}
                  />
                  <Text size="14pt" weight="semibold" color="labelTertiary">
                    {i18n.t('swap.tokens_input.sort')}
                  </Text>
                </Inline>
              </Box>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              accentColor={asset?.colors?.primary || asset?.colors?.fallback}
              marginRight="32px"
            >
              <DropdownMenuRadioGroup
                value={sortMethod}
                onValueChange={(method) => {
                  setSortMethod(method as SortMethod);
                }}
              >
                <DropdownMenuRadioItem value="token" selectedValue={sortMethod}>
                  <Inline space="8px" alignVertical="center">
                    <Bleed vertical="4px">
                      <Symbol
                        weight="semibold"
                        symbol="record.circle.fill"
                        size={18}
                        color="label"
                      />
                    </Bleed>

                    <Text size="14pt" weight="semibold" color="label">
                      {i18n.t('swap.tokens_input.token_balance')}
                    </Text>
                  </Inline>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="chain" selectedValue={sortMethod}>
                  <Inline space="8px" alignVertical="center">
                    <Bleed vertical="4px">
                      <Symbol
                        weight="semibold"
                        symbol="network"
                        size={18}
                        color="label"
                      />
                    </Bleed>

                    <Text size="14pt" weight="semibold" color="label">
                      {i18n.t('swap.tokens_input.networks')}
                    </Text>
                  </Inline>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
            const asset = assets?.[index];
            return (
              <Box
                paddingHorizontal="8px"
                key={`${asset?.uniqueId}-${i}`}
                onClick={() => onSelectAsset?.(asset)}
                testId={`token-input-asset-${asset?.uniqueId}`}
              >
                <TokenToSellRow uniqueId={asset?.uniqueId} />
              </Box>
            );
          })}
        {!assets?.length && (
          <Box alignItems="center" style={{ paddingTop: 121 }}>
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
                  {i18n.t('swap.tokens_input.nothing_found_description')}
                </Text>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>
    </Stack>
  );
};
