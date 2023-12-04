import { Variants, motion } from 'framer-motion';
import React, { ReactElement } from 'react';

import { TextProps } from '../Text/Text';

export const AnimatedRows: React.FC<{
  rows: ReactElement<TextProps>[];
  id?: string;
}> = ({ rows, id }) => {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 1, // Adjust the delay for each row
        delayChildren: 1,
      },
    },
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.25, // Adjust the delay for each character
      },
    },
  };

  const charVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const animateRowChildren = (children: React.ReactNode) => {
    // Ensure that children is a string
    const text = typeof children === 'string' ? children : '';

    return (
      <motion.div variants={rowVariants}>
        {text.split('').map((char, index) => (
          <motion.span key={index} variants={charVariants}>
            {char}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {rows.map((row, rowIndex) =>
        React.cloneElement(row, {
          ...row.props,
          children: animateRowChildren(row.props.children),
          key: id ? `${id}-row-${rowIndex}` : `row-${rowIndex}`,
        }),
      )}
    </motion.div>
  );
};
