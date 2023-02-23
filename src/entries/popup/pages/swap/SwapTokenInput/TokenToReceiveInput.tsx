import React from 'react';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import { Box, Stack, Text } from '~/design-system';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

const { innerWidth: windowWidth } = window;

export const TokenToReceiveInput = ({
  asset,
  placeholder,
}: {
  asset: ParsedAddressAsset | null;
  placeholder: string;
}) => {
  return (
    <Box width="fit">
      <Stack space="8px">
        <TextOverflow
          maxWidth={windowWidth / 2}
          size="16pt"
          weight="semibold"
          color={`${asset ? 'label' : 'labelTertiary'}`}
        >
          {asset?.name ?? placeholder}
        </TextOverflow>

        {asset && (
          <Text as="p" size="12pt" weight="semibold" color="labelTertiary">
            {handleSignificantDecimals(asset?.balance.amount, asset?.decimals)}{' '}
            {i18n.t('send.tokens_input.available')}
          </Text>
        )}
      </Stack>
    </Box>
  );
};
