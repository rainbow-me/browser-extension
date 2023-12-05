import { Variants, motion } from 'framer-motion';
import React, { ReactElement, useMemo } from 'react';

import { BoxStyles } from '~/design-system/styles/core.css';

import { Box } from '../Box/Box';
import { Stack } from '../Stack/Stack';

export const AnimatedTextRows = ({
  rows,
  rowsText,
  id,
  space,
  customDelay,
}: {
  rows: ReactElement[];
  rowsText: string[];
  space?: BoxStyles['gap'];
  customDelay?: number;
  id?: string;
}) => {
  const charDisplayDuration = 0.1;

  const rowDelays = useMemo(() => {
    let totalDuration = 0;
    return rowsText.map((text) => {
      const delay = totalDuration;
      totalDuration += text.length * charDisplayDuration;
      return delay;
    });
  }, [rowsText]);

  const rowVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (delay: number) => ({
      opacity: 1,
      transition: { delay, delayChildren: delay },
    }),
  };

  return (
    <Stack space={space}>
      {rows.map((row, rowIndex) => (
        <Box
          as={motion.div}
          key={id ? `${id}-row-${rowIndex}` : `row-${rowIndex}`}
          custom={customDelay !== undefined ? customDelay : rowDelays[rowIndex]}
          variants={rowVariants}
          initial="hidden"
          animate="visible"
        >
          {row}
        </Box>
      ))}
    </Stack>
  );
};
