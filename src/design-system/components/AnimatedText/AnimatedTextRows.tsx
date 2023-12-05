import { Variants, motion } from 'framer-motion';
import React, { ReactNode, useMemo } from 'react';

export const AnimatedTextRows: React.FC<{
  rows: ReactNode[];
  rowsText: string[];
  id?: string;
}> = ({ rows, rowsText, id }) => {
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
    <motion.div initial="hidden" animate="visible">
      {rows.map((row, rowIndex) => (
        <motion.div
          key={id ? `${id}-row-${rowIndex}` : `row-${rowIndex}`}
          custom={rowDelays[rowIndex]}
          variants={rowVariants}
          initial="hidden"
          animate="visible"
        >
          {row}
        </motion.div>
      ))}
    </motion.div>
  );
};
