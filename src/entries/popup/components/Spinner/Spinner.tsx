import { motion } from 'framer-motion';
import React from 'react';

import { Box } from '~/design-system';

import { spinnerStyle } from './Spinner.css';

export function Spinner() {
  return (
    <Box
      as={motion.div}
      animate={{ rotate: 360 }}
      transition={{
        ease: 'linear',
        duration: 1,
        repeat: Infinity,
        repeatDelay: 0,
      }}
      className={spinnerStyle}
    />
  );
}
