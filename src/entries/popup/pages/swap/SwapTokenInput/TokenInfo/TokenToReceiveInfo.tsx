import React, { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import { Box, Inline, Text } from '~/design-system';

export const TokenToReceiveInfo = ({
  asset,
}: {
  asset: ParsedAddressAsset | null;
}) => {
  const priceChangeDisplay = useMemo(() => {
    const priceChange = asset?.native?.price?.change;
    return priceChange?.length ? priceChange : '-';
  }, [asset?.native?.price?.change]);

  if (!asset) return null;
  return (
    <Box width="full">
      <Inline alignHorizontal="justify">
        <Inline alignVertical="center" space="4px">
          <Text as="p" size="12pt" weight="semibold" color="labelTertiary">
            {asset?.native?.price?.display}
          </Text>
          <Text as="p" size="12pt" weight="medium" color="labelQuaternary">
            ({priceChangeDisplay})
          </Text>
        </Inline>

        <Inline alignVertical="center" space="4px">
          <Text size="12pt" weight="medium" color="labelQuaternary">
            {i18n.t('swap.balance')}
          </Text>
          <Text size="12pt" weight="medium" color="labelSecondary">
            {handleSignificantDecimals(asset?.balance?.amount, asset?.decimals)}
          </Text>
        </Inline>
      </Inline>
    </Box>
  );
};
