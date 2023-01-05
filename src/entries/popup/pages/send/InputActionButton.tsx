import { motion } from 'framer-motion';
import React from 'react';

import { Box, Inline, Symbol } from '~/design-system';

export const InputActionButon = ({
  showClose,
  onClose,
  dropdownVisible,
  testId,
}: {
  showClose: boolean;
  dropdownVisible: boolean;
  onClose: () => void;
  testId?: string;
}) => {
  return showClose ? (
    <Box
      style={{
        width: 24,
        height: 24,
      }}
      borderRadius="12px"
      background="fillSecondary"
      onClick={onClose}
      testId={testId}
    >
      <Inline height="full" alignHorizontal="center" alignVertical="center">
        <Symbol size={8} symbol="xmark" weight="bold" color="label" />
      </Inline>
    </Box>
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
