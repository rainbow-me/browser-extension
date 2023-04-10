import React, { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import { Box, Inline, Text, TextOverflow } from '~/design-system';

export const TokenToBuyInfo = ({
  asset,
}: {
  asset: ParsedSearchAsset | null;
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
          <TextOverflow
            testId={'token-to-buy-info-price'}
            as="p"
            size="12pt"
            weight="semibold"
            color="labelTertiary"
          >
            {asset?.native?.price?.display}
          </TextOverflow>
          <Text as="p" size="12pt" weight="medium" color="labelQuaternary">
            ({priceChangeDisplay})
          </Text>
        </Inline>

        <Inline alignVertical="center" space="4px">
          <Text size="12pt" weight="medium" color="labelQuaternary">
            {`${i18n.t('swap.balance')}:`}
          </Text>
          <TextOverflow
            testId={'token-to-buy-info-balance'}
            size="12pt"
            weight="medium"
            color="labelSecondary"
          >
            {asset?.balance?.amount &&
              handleSignificantDecimals(
                asset?.balance?.amount,
                asset?.decimals,
              )}
          </TextOverflow>
        </Inline>
      </Inline>
    </Box>
  );
};
