import { motion } from 'framer-motion';
import React from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import { Box, Button, Inline, Symbol, TextOverflow } from '~/design-system';

export const SwapInputActionButton = ({
  showClose,
  onClose,
  dropdownVisible,
  testId,
  asset,
}: {
  showClose: boolean;
  dropdownVisible: boolean;
  onClose: () => void;
  testId?: string;
  asset?: ParsedAddressAsset;
}) => {
  return showClose ? (
    <Button
      color="accent"
      height="28px"
      variant="flat"
      onClick={onClose}
      testId={testId}
    >
      <Inline
        space="8px"
        height="full"
        alignHorizontal="center"
        alignVertical="center"
      >
        <Symbol size={8} symbol="xmark" weight="bold" color="label" />
        <TextOverflow maxWidth={50} size="14pt" weight="bold" color="label">
          {asset?.symbol}
        </TextOverflow>
      </Inline>
    </Button>
  ) : (
    <Box
      as={motion.div}
      animate={dropdownVisible ? { rotate: 180 } : { rotate: 0 }}
    >
      <Inline alignVertical="center">
        <Symbol
          size={18}
          symbol={'chevron.down.circle'}
          weight="semibold"
          color="labelQuaternary"
        />
      </Inline>
    </Box>
  );
};
