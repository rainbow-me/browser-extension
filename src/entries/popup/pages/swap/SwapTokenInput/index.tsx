import { motion } from 'framer-motion';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { ParsedAddressAsset } from '~/core/types/assets';
import {
  Bleed,
  Box,
  Inline,
  Inset,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import {
  DropdownInputWrapper,
  dropdownContainerVariant,
  dropdownItemVariant,
} from '../../../components/DropdownInputWrapper/DropdownInputWrapper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../../components/DropdownMenu/DropdownMenu';
import { Tooltip } from '../../../components/Tooltip/Tooltip';
import { SortMethod } from '../../../hooks/send/useSendTransactionAsset';
import { AssetRow } from '../../home/Tokens';
import { SwapInputActionButton } from '../SwapInputActionButton';
import {
  swapTokenInputHighlightWrapperStyleDark,
  swapTokenInputHighlightWrapperStyleLight,
} from '../SwapTokenInput.css';

import { TokenToReceiveInput } from './TokenToReceiveInput';
import { TokenToSwapInput } from './TokenToSwapInput';

const RowHighlightWrapper = ({ children }: { children: ReactNode }) => {
  const { currentTheme } = useCurrentThemeStore();
  return (
    <Inset>
      <Box
        borderRadius="12px"
        className={
          currentTheme === 'dark'
            ? swapTokenInputHighlightWrapperStyleDark
            : swapTokenInputHighlightWrapperStyleLight
        }
      >
        {children}
      </Box>
    </Inset>
  );
};

const SwapTokenToSwapBottom = ({
  asset,
}: {
  asset: ParsedAddressAsset | null;
}) => {
  return (
    <Box width="full">
      <Inline alignHorizontal="justify">
        {asset && (
          <Text as="p" size="12pt" weight="semibold" color="labelTertiary">
            {asset?.native?.balance?.display}
          </Text>
        )}
        <Tooltip
          text={`1.23 ${asset?.symbol}`}
          textColor="labelSecondary"
          textSize="12pt"
          textWeight="medium"
        >
          <Box
            as={motion.div}
            whileHover={{ scale: transformScales['1.04'] }}
            whileTap={{ scale: transformScales['0.96'] }}
            transition={transitions.bounce}
          >
            <Inline alignVertical="center" space="4px">
              <Box marginVertical="-10px">
                <Symbol
                  symbol="wand.and.stars"
                  size={12}
                  weight="heavy"
                  color="accent"
                />
              </Box>

              <Text size="12pt" weight="heavy" color="accent">
                {'Max'}
              </Text>
            </Inline>
          </Box>
        </Tooltip>
      </Inline>
    </Box>
  );
};

export const SwapTokenInput = ({
  asset,
  assets,
  selectAssetAddress,
  dropdownClosed = false,
  setSortMethod,
  sortMethod,
  zIndex,
  placeholder,
  onDropdownOpen,
  dropdownHeight,
  type,
}: {
  asset: ParsedAddressAsset | null;
  assets: ParsedAddressAsset[];
  selectAssetAddress: (address: Address | '') => void;
  dropdownClosed: boolean;
  setSortMethod: (sortMethod: SortMethod) => void;
  sortMethod: SortMethod;
  zIndex?: number;
  placeholder: string;
  onDropdownOpen: (open: boolean) => void;
  dropdownHeight?: number;
  type: 'toSwap' | 'toReceive';
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const innerRef = useRef<HTMLInputElement>(null);

  const onDropdownAction = useCallback(() => {
    onDropdownOpen(!dropdownVisible);
    setDropdownVisible(!dropdownVisible);
  }, [dropdownVisible, onDropdownOpen]);

  const onSelectAsset = useCallback(
    (address: Address | '') => {
      selectAssetAddress(address);
      onDropdownOpen(false);
      setDropdownVisible(false);
      setTimeout(() => innerRef?.current?.focus(), 300);
    },
    [onDropdownOpen, selectAssetAddress],
  );

  useEffect(() => {
    if (dropdownClosed) {
      setDropdownVisible(false);
    }
  }, [dropdownClosed]);

  return (
    <DropdownInputWrapper
      zIndex={zIndex || 1}
      dropdownHeight={dropdownHeight || 376}
      testId={'token-input'}
      leftComponent={
        <Box>
          <CoinIcon asset={asset ?? undefined} />
        </Box>
      }
      centerComponent={
        type === 'toSwap' ? (
          <TokenToSwapInput
            innerRef={innerRef}
            asset={asset}
            placeholder={placeholder}
          />
        ) : (
          <TokenToReceiveInput asset={asset} placeholder={placeholder} />
        )
      }
      bottomComponent={
        type === 'toSwap' && !!asset ? (
          <SwapTokenToSwapBottom asset={asset} />
        ) : undefined
      }
      rightComponent={
        <SwapInputActionButton
          showClose={!!asset}
          onClose={() => onSelectAsset('')}
          dropdownVisible={dropdownVisible}
          testId={`input-wrapper-close-${'token-input'}`}
          asset={asset}
        />
      }
      dropdownComponent={
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
                  {i18n.t('send.tokens_input.tokens')}
                </Text>
              </Inline>
              <DropdownMenu
                onOpenChange={setSortDropdownOpen}
                open={sortDropdownOpen}
              >
                <DropdownMenuTrigger
                  accentColor={
                    asset?.colors?.primary || asset?.colors?.fallback
                  }
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
                        {i18n.t('send.tokens_input.sort')}
                      </Text>
                    </Inline>
                  </Box>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  accentColor={
                    asset?.colors?.primary || asset?.colors?.fallback
                  }
                  marginRight="32px"
                >
                  <DropdownMenuRadioGroup
                    value={sortMethod}
                    onValueChange={(method) => {
                      setSortMethod(method as SortMethod);
                    }}
                  >
                    <DropdownMenuRadioItem
                      value="token"
                      selectedValue={sortMethod}
                    >
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
                          {i18n.t('send.tokens_input.token_balance')}
                        </Text>
                      </Inline>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="chain"
                      selectedValue={sortMethod}
                    >
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
                          {i18n.t('send.tokens_input.networks')}
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
          >
            {!!assets?.length &&
              assets?.map((asset, i) => (
                <Box
                  paddingHorizontal="8px"
                  key={`${asset?.uniqueId}-${i}`}
                  onClick={() => onSelectAsset(asset.address)}
                  testId={`token-input-asset-${asset?.uniqueId}`}
                >
                  <RowHighlightWrapper>
                    <Box
                      as={motion.div}
                      variants={dropdownItemVariant}
                      marginHorizontal="-8px"
                    >
                      <AssetRow uniqueId={asset?.uniqueId} />
                    </Box>
                  </RowHighlightWrapper>
                </Box>
              ))}
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
      }
      dropdownVisible={dropdownVisible}
      onDropdownAction={onDropdownAction}
      borderVisible
    />
  );
};
