import { motion } from 'framer-motion';
import React, { CSSProperties, ReactNode } from 'react';

import { transformScales, transitions } from '../../styles/designTokens';
import { Box } from '../Box/Box';

interface ButtonOverflowProps {
  children: ReactNode;
  style?: CSSProperties;
  testId?: string;
}
export function ButtonOverflow({ children, testId }: ButtonOverflowProps) {
  return (
    <Box
      as={motion.div}
      initial={{ zIndex: 0 }}
      whileHover={{ scale: transformScales['1.04'] }}
      whileTap={{ scale: transformScales['0.96'] }}
      transition={transitions.bounce}
      testId={testId}
    >
      {children}
    </Box>
  );
}
