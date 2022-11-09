import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';

import { Box, Text } from '~/design-system';

import { menuTransition } from '../../utils/animation';

export function Transactions() {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <Link to="/settings">
        <Box
          as="button"
          background="surfaceSecondary"
          padding="16px"
          style={{ borderRadius: 999, width: '100%' }}
        >
          <Text color="labelSecondary" size="14pt" weight="bold">
            Back to Settings
          </Text>
        </Box>
      </Link>
    </Box>
  );
}
