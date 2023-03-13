import { motion } from 'framer-motion';
import React from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import { Box, Button, Inline, Symbol, TextOverflow } from '~/design-system';

export const SwapInputActionButton = ({
  asset,
  dropdownVisible,
  showClose,
  testId,
  onClose,
}: {
  asset: ParsedSearchAsset | null;
  dropdownVisible: boolean;
  showClose: boolean;
  testId?: string;
  onClose: () => void;
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
