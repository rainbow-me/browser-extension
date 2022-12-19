import { motion } from 'framer-motion';
import React from 'react';

import { Box, Inline, Symbol } from '~/design-system';

export const InputActionButon = ({
  showClose,
  onClose,
  dropdownVisible,
  onDropdownAction,
}: {
  showClose: boolean;
  dropdownVisible: boolean;
  onClose: () => void;
  onDropdownAction: () => void;
}) => {
  return showClose ? (
    <Box
      style={{
        width: 24,
        height: 24,
      }}
      borderRadius="12px"
      background="surfaceMenu"
      borderWidth="1px"
      borderColor="buttonStroke"
      onClick={onClose}
    >
      <Inline height="full" alignHorizontal="center" alignVertical="center">
        <Symbol size={8} symbol="xmark" weight="bold" color="label" />
      </Inline>
    </Box>
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
