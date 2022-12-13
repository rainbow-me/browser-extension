import React from 'react';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { Box, Inline, Stack, Text } from '~/design-system';

import { CoinIcon } from '../../components/CoinIcon/CoinIcon';

import { InputActionButon } from './InputActionButton';

export const TokenInput = ({
  asset,
  shuffleAssetIndex,
}: {
  asset: ParsedAddressAsset | null;
  shuffleAssetIndex: (n?: number) => void;
}) => {
  return (
    <Box
      background="surfaceSecondaryElevated"
      paddingVertical="20px"
      paddingHorizontal="20px"
      borderRadius="24px"
      width="full"
    >
      <Stack space="16px">
        <Inline alignHorizontal="justify" alignVertical="center" space="8px">
          <Box onClick={() => shuffleAssetIndex()}>
            <Inline alignVertical="center" space="8px">
              <Box>
                <CoinIcon asset={asset ?? undefined} />
              </Box>

              <Box width="fit">
                <Text
                  size="16pt"
                  weight="semibold"
                  color={`${asset ? 'label' : 'labelTertiary'}`}
                >
                  {asset?.name ?? i18n.t('send.input_token_placeholder')}
                </Text>
              </Box>
            </Inline>
          </Box>
          <InputActionButon
            showClose={!!asset}
            onClose={() => shuffleAssetIndex(-1)}
          />
        </Inline>
      </Stack>
    </Box>
  );
};
