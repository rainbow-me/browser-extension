import { Variants, motion } from 'framer-motion';
import React from 'react';

import { Text, TextProps } from '../Text/Text';

type AnimationDirection = 'rightToLeft' | 'leftToRight';

export const AnimatedText = ({
  id,
  children,
  delay = 0,
  direction = 'leftToRight',
  ...textProps
}: TextProps & {
  id?: string;
  delay?: number;
  direction?: AnimationDirection;
}) => {
  if (typeof children !== 'string') {
    console.error('AnimatedText expects a string as children');
    return null;
  }

  const characters = children.split('');
  const totalCharacters = characters.length;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1, // Stagger time between animations
      },
    },
  };

  const charVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay:
          delay +
          (direction === 'rightToLeft' ? totalCharacters - i - 1 : i) * 0.1,
      },
    }),
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
          <motion.span key={(id || '') + i} custom={i} variants={charVariants}>
            {char}
          </motion.span>
        ))}
      </motion.div>
    </Text>
  );
};
