import { motion } from 'framer-motion';
import React from 'react';

import { Box } from '~/design-system';
import { menuTransition } from '~/entries/popup/utils/animation';

export function Currency() {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    ></Box>
  );
}
