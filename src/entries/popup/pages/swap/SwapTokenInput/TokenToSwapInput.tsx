import { motion } from 'framer-motion';
import React, { RefObject } from 'react';

import { i18n } from '~/core/languages';
import { ParsedAddressAsset } from '~/core/types/assets';
import { Box, Inline, Symbol, Text } from '~/design-system';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';
import { Tooltip } from '~/entries/popup/components/Tooltip/Tooltip';

import { SwapInputMask } from '../../../components/InputMask/SwapInputMask/SwapInputMask';

export const TokenToSwapBottomComponent = ({
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
                {i18n.t('swap.max')}
              </Text>
            </Inline>
          </Box>
        </Tooltip>
      </Inline>
    </Box>
  );
};

export const TokenToSwapInput = ({
  asset,
  placeholder,
  innerRef,
}: {
  asset: ParsedAddressAsset | null;
  placeholder: string;
  innerRef?: RefObject<HTMLInputElement>;
}) => {
  return !asset ? (
    <Box width="fit">
      <Text
        size="16pt"
        weight="semibold"
        color={`${asset ? 'label' : 'labelTertiary'}`}
      >
        {placeholder}
      </Text>
    </Box>
  ) : (
    <Box width="fit" marginVertical="-20px">
      <SwapInputMask
        borderColor="transparent"
        decimals={asset?.decimals}
        height="56px"
        placeholder="0.00"
        value={''}
        variant="transparent"
        onChange={() => null}
        paddingHorizontal={0}
        innerRef={innerRef}
      />
    </Box>
  );
};
