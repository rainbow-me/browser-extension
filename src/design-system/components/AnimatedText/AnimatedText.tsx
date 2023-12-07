import { Variants, motion } from 'framer-motion';
import React, { ReactNode } from 'react';

import { CHARACTER_TYPING_SPEED } from '~/entries/popup/pages/home/Points/utils';

import { Box } from '../Box/Box';
import { Inline } from '../Inline/Inline';
import { Text, TextProps } from '../Text/Text';

type AnimationDirection = 'rightToLeft' | 'leftToRight';

const RainbowTextWrapper = ({
  children,
  characters,
}: {
  children: ReactNode;
  characters: string[];
}) => {
  if (characters.includes('\\')) {
    return <Inline space={'3px'}>{children}</Inline>;
  }
  return <>{children}</>;
};

export const AnimatedText = ({
  id,
  children,
  delay = 0,
  direction = 'leftToRight',
  customTypingSpeed,
  ...textProps
}: TextProps & {
  id?: string;
  delay?: number;
  direction?: AnimationDirection;
  customTypingSpeed?: number;
}) => {
  if (typeof children !== 'string') {
    console.error('AnimatedText expects a string as children');
    return null;
  }

  const characters = children.split('');
  console.log('characters', characters);
  const totalCharacters = characters.length;

  const typingSpeed =
    customTypingSpeed !== undefined
      ? customTypingSpeed
      : CHARACTER_TYPING_SPEED;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: typingSpeed,
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
          (direction === 'rightToLeft' ? totalCharacters - i - 1 : i) *
            typingSpeed,
      },
    }),
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text {...textProps}>
      <Box
        as={motion.div}
        key={id}
        id={id}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <RainbowTextWrapper characters={characters}>
          {characters.map((char, i) => (
            <Box
              as={motion.span}
              key={(id || '') + i}
              custom={i}
              variants={charVariants}
            >
              {char === '\\' ? `${char}` : char}
            </Box>
          ))}
        </RainbowTextWrapper>
      </Box>
    </Text>
  );
};
