import { motion } from 'framer-motion';
import React from 'react';

import { Text, TextProps } from '../Text/Text';

export const AnimatedText: React.FC<TextProps & { id?: string }> = ({
  id,
  children,
  ...textProps
}) => {
  if (typeof children !== 'string') {
    console.error('AnimatedText expects a string as children');
    return null;
  }

  const characters = children.split('');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0.15,
        staggerChildren: 0.15,
      },
    },
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
      >
        {characters.map((char, i) => (
          <motion.span
            key={(id || '') + i}
            id={(id || '') + i}
            variants={charVariants}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </Text>
  );
};
