import React, { ReactNode, useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { ParsedAddressAsset } from '~/core/types/assets';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import { Box, Inline, Inset, Stack, Symbol, Text } from '~/design-system';

import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { AssetRow } from '../home/Tokens';

import { InputWrapper } from './InputWrapper';
import {
  addressToInputHighlightWrapperStyleDark,
  addressToInputHighlightWrapperStyleLight,
} from './ToAddressInpnut.css';

const RowHighlightWrapper = ({ children }: { children: ReactNode }) => {
  const { currentTheme } = useCurrentThemeStore();
  return (
    <Inset>
      <Box
        borderRadius="12px"
        className={
          currentTheme === 'dark'
            ? addressToInputHighlightWrapperStyleDark
            : addressToInputHighlightWrapperStyleLight
        }
      >
        {children}
      </Box>
    </Inset>
  );
};

export const TokenInput = ({
  asset,
  assets,
  selectAssetIndex,
  dropdownClosed = false,
}: {
  asset: ParsedAddressAsset | null;
  assets: ParsedAddressAsset[];
  selectAssetIndex: (n?: number) => void;
  dropdownClosed: boolean;
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const onDropdownAction = useCallback(
    () => setDropdownVisible((dropdownVisible) => !dropdownVisible),
    [],
  );
  const onSelectAsset = useCallback(
    (i: number) => {
      selectAssetIndex(i);
      setDropdownVisible(false);
    },
    [selectAssetIndex],
  );

  useEffect(() => {
    if (dropdownClosed) {
      setDropdownVisible(false);
    }
  }, [dropdownClosed]);

  return (
    <InputWrapper
      zIndex={1}
      dropdownHeight={376}
      leftComponent={
        <Box>
          <CoinIcon asset={asset ?? undefined} />
        </Box>
      }
      centerComponent={
        <Box width="fit">
          <Stack space="8px">
            <Text
              size="16pt"
              weight="semibold"
              color={`${asset ? 'label' : 'labelTertiary'}`}
            >
              {asset?.name ?? i18n.t('send.input_token_placeholder')}
            </Text>
            {asset && (
              <Text size="12pt" weight="semibold" color={`labelTertiary`}>
                {handleSignificantDecimals(
                  asset?.balance.amount,
                  asset?.decimals,
                )}{' '}
                {i18n.t('send.tokens_input.available')}
              </Text>
            )}
          </Stack>
        </Box>
      }
      showActionClose={!!asset}
      onActionClose={() => selectAssetIndex(-1)}
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
            </Inline>
          </Box>
          <Box>
            {assets?.map((asset, i) => (
              <Box
                paddingHorizontal="8px"
                key={`${asset?.uniqueId}-${i}`}
                onClick={() => onSelectAsset(i)}
              >
                <RowHighlightWrapper>
                  <Box marginHorizontal="-8px">
                    <AssetRow uniqueId={asset?.uniqueId} />
                  </Box>
                </RowHighlightWrapper>
              </Box>
            ))}
          </Box>
        </Stack>
      }
      dropdownVisible={dropdownVisible}
      onDropdownAction={onDropdownAction}
    />
  );
};
