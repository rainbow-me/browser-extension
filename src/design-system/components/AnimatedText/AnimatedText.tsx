import { motion } from 'framer-motion';
import React from 'react';

import { Text, TextProps } from '../Text/Text';

export const AnimatedText: React.FC<
  TextProps & { id?: string; delay?: number }
> = ({ id, children, delay, ...textProps }) => {
  if (typeof children !== 'string') {
    console.error('AnimatedText expects a string as children');
    return null;
  }

  const characters = children.split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (delay: number) => ({
      opacity: 1,
      transition: { delayChildren: delay, staggerChildren: 0.1 },
    }),
  };

  const charVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text {...textProps}>
      <motion.div
        key={id}
        id={id || ''}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        custom={delay}
      >
        {characters.map((char, i) => (
          <motion.span key={(id || '') + i} variants={charVariants}>
            {char}
          </motion.span>
        ))}
      </motion.div>
    </Text>
  );
};
