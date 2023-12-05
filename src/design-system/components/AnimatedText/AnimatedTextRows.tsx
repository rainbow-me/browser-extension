import { Variants, motion } from 'framer-motion';
import React, { ReactElement, useMemo } from 'react';

import { TextProps } from '../Text/Text';

export const AnimatedTextRows: React.FC<{
  rows: ReactElement<TextProps>[];
  id?: string;
}> = ({ rows, id }) => {
  const charAnimationDuration = 0.0;
  const staggerDuration = 0.1;

  const rowDelays = useMemo(() => {
    let totalDuration = 0;
    return rows.map((row) => {
      const delay = totalDuration;
      const rowLength =
        typeof row.props.children === 'string' ? row.props.children.length : 0;
      totalDuration += rowLength * staggerDuration + charAnimationDuration;
      return delay;
    });
  }, [rows]);

  const rowVariants = (delay: number): Variants => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDuration,
        delayChildren: delay,
      },
    },
  });

  const charVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const animateRowChildren = (children: React.ReactNode, key: string) => {
    if (typeof children === 'string') {
      return children.split('').map((char, index) => (
        <motion.span key={key + index} variants={charVariants}>
          {char}
        </motion.span>
      ));
    }
    return children;
  };

  return (
    <motion.div initial="hidden" animate="visible">
      {rows.map((row, rowIndex) => (
        <motion.div
          key={id ? `${id}-row-${rowIndex}` : `row-${rowIndex}`}
          variants={rowVariants(rowDelays[rowIndex])}
        >
          {React.cloneElement(row, {
            ...row.props,
            children: animateRowChildren(
              row.props.children,
              id ? `${id}-row-${rowIndex}` : `row-${rowIndex}`,
            ),
          })}
        </motion.div>
      ))}
    </motion.div>
  );
};
