import { motion } from 'framer-motion';
import React from 'react';

import { Box, Inline, Symbol } from '~/design-system';
import { Lens } from '~/design-system/components/Lens/Lens';

export const InputActionButton = ({
  showClose,
  dropdownVisible,
  onClose,
  onDropdownAction,
  testId,
}: {
  showClose: boolean;
  dropdownVisible: boolean;
  onClose: () => void;
  onDropdownAction: () => void;
  testId?: string;
}) => {
  return showClose ? (
    <Lens
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
    </Lens>
  ) : (
    <Box
      as={motion.div}
      animate={dropdownVisible ? { rotate: 180 } : { rotate: 0 }}
      onClick={onDropdownAction}
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
