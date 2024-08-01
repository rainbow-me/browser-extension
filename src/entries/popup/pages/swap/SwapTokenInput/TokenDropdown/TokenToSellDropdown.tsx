import { motion } from 'framer-motion';

import { ParsedSearchAsset } from '~/core/types/assets';
import { Bleed, Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { SortMethod } from '~/entries/popup/hooks/send/useSendAsset';
import { useTranslationContext } from '~/entries/popup/hooks/useTranslationContext';
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
  asset: ParsedSearchAsset | null;
  assets?: ParsedSearchAsset[];
  sortMethod: SortMethod;
  onSelectAsset?: (asset: ParsedSearchAsset) => void;
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
    size: 52,
  });

  const t = useTranslationContext();

  return (
    <Stack space="8px">
      <Box paddingHorizontal="20px">
        <Inline alignHorizontal="justify">
          <Inline space="4px" alignVertical="center">
            <Symbol
              symbol="circlebadge.2.fill"
              color="labelTertiary"
              weight="semibold"
              size={14}
            />
            <Text size="14pt" weight="semibold" color="labelTertiary">
              {t('swap.tokens_input.tokens')}
            </Text>
          </Inline>
          <DropdownMenu onOpenChange={onDropdownChange}>
            <DropdownMenuTrigger
              accentColor={asset?.colors?.primary || asset?.colors?.fallback}
              asChild
            >
              <Box testId="token-to-sell-sort-trigger">
                <Inline space="4px" alignVertical="center">
                  <Symbol
                    symbol="arrow.up.arrow.down"
                    color="labelTertiary"
                    weight="semibold"
                    size={14}
                  />
                  <Text size="14pt" weight="semibold" color="labelTertiary">
                    {t('swap.tokens_input.sort')}
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
                  <Box testId="token-to-sell-sort-balance">
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
                        {t('swap.tokens_input.token_balance')}
                      </Text>
                    </Inline>
                  </Box>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="chain" selectedValue={sortMethod}>
                  <Box testId="token-to-sell-sort-network">
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
                        {t('swap.tokens_input.networks')}
                      </Text>
                    </Inline>
                  </Box>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Inline>
      </Box>
      <Box
        ref={containerRef}
        style={{
          height: `523px`,
          overflow: 'auto',
        }}
      >
        <Box
          as={motion.div}
          variants={dropdownContainerVariant}
          initial="hidden"
          animate="show"
          style={{
            height: `${assetsRowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {!!assets?.length &&
            assetsRowVirtualizer?.getVirtualItems().map((virtualItem, i) => {
              const { key, index, size, start } = virtualItem;
              const asset = assets?.[index];
              return (
                <Box
                  as={motion.div}
                  paddingHorizontal="8px"
                  key={`${asset?.uniqueId}-${i}-${key}`}
                  onClick={() => onSelectAsset?.(asset as ParsedSearchAsset)}
                  testId={`${asset?.uniqueId}-token-to-sell-row`}
                  position="absolute"
                  width="full"
                  style={{
                    height: size,
                    y: start,
                  }}
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
                    {t('swap.tokens_input.nothing_found')}
                  </Text>

                  <Text
                    color="labelQuaternary"
                    size="14pt"
                    weight="regular"
                    align="center"
                  >
                    {t('swap.tokens_input.nothing_found_description')}
                  </Text>
                </Stack>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Stack>
  );
};
