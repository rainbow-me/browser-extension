import React, { useMemo } from 'react';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import {
  Box,
  Column,
  Columns,
  Inline,
  Text,
  TextOverflow,
} from '~/design-system';

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
    <Box>
      <Columns alignHorizontal="justify" space="4px">
        <Column>
          <Columns alignVertical="center" space="4px">
            <Column width="content">
              <TextOverflow
                testId={'token-to-buy-info-price'}
                as="p"
                size="12pt"
                weight="semibold"
                color="labelTertiary"
              >
                {asset?.native?.price?.display}
              </TextOverflow>
            </Column>

            <Column width="content">
              <Text as="p" size="12pt" weight="medium" color="labelQuaternary">
                ({priceChangeDisplay})
              </Text>
            </Column>
          </Columns>
        </Column>

        <Column>
          <Inline alignHorizontal="right">
            <Columns alignVertical="center" alignHorizontal="right" space="4px">
              <Column width="content">
                <Text size="12pt" weight="medium" color="labelQuaternary">
                  {`${i18n.t('swap.balance')}:`}
                </Text>
              </Column>

              <Column>
                <Box width="fit">
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
                </Box>
              </Column>
            </Columns>
          </Inline>
        </Column>
      </Columns>
    </Box>
  );
};
