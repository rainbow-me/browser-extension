import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import { convertAmountAndPriceToNativeDisplay } from '~/core/utils/numbers';
import { Box, Inline, Symbol, Text, TextOverflow } from '~/design-system';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';
import { Tooltip } from '~/entries/popup/components/Tooltip/Tooltip';

const { innerWidth: windowWidth } = window;
const TEXT_MAX_WIDTH = windowWidth - 120;

export const TokenToSellInfo = ({
  asset,
  assetToSellValue,
  assetToSellMaxValue,
  setAssetToSellMaxValue,
}: {
  asset: ParsedAddressAsset | null;
  assetToSellValue: string;
  assetToSellMaxValue: { display: string; amount: string };
  setAssetToSellMaxValue: () => void;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  if (!asset) return null;
  return (
    <Box width="full">
      <Inline alignHorizontal="justify">
        {asset && (
          <TextOverflow
            maxWidth={TEXT_MAX_WIDTH}
            as="p"
            size="12pt"
            weight="semibold"
            color="labelTertiary"
          >
            {
              convertAmountAndPriceToNativeDisplay(
                assetToSellValue || 0,
                asset?.price?.value || 0,
                currentCurrency,
              ).display
            }
          </TextOverflow>
        )}
        <Tooltip
          text={`${assetToSellMaxValue.display} ${asset?.symbol}`}
          textColor="labelSecondary"
          textSize="12pt"
          textWeight="medium"
        >
          <Box
            as={motion.div}
            whileHover={{ scale: transformScales['1.04'] }}
            whileTap={{ scale: transformScales['0.96'] }}
            transition={transitions.bounce}
            onClick={setAssetToSellMaxValue}
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
                {i18n.t('swap.max')}
              </Text>
            </Inline>
          </Box>
        </Tooltip>
      </Inline>
    </Box>
  );
};
