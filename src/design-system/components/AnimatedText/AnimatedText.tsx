import { Variants, motion } from 'framer-motion';

import { CHARACTER_TYPING_SPEED } from '~/entries/popup/pages/home/Points/utils';

import { Box } from '../Box/Box';
import { Text, TextProps } from '../Text/Text';

type AnimationDirection = 'rightToLeft' | 'leftToRight';

const rainbowColors = {
  blue: { text: '#31BCC4', shadow: 'rgba(49, 188, 196, 0.8)' },
  green: { text: '#57EA5F', shadow: 'rgba(87, 234, 95, 0.8)' },
  yellow: { text: '#F0D83F', shadow: 'rgba(240, 216, 63, 0.8)' },
  red: { text: '#DF5337', shadow: 'rgba(223, 83, 55, 0.8)' },
  purple: { text: '#B756A7', shadow: 'rgba(183, 86, 167, 0.8)' },
};

const generateRainbowColors = (
  text: string,
): Array<{ text: string; shadow: string }> | undefined => {
  let colorIndex = 0;
  let repeatCount = 0;
  const colorKeys: string[] = Object.keys(rainbowColors);
  const colors: Array<{ text: string; shadow: string }> = [];
  const repeatLength: number = Math.floor(text.length / (colorKeys.length * 2));

  text.split('').forEach(() => {
    if (repeatCount >= repeatLength + Math.round(Math.random())) {
      repeatCount = 0;
      colorIndex = (colorIndex + 1) % colorKeys.length;
    }
    colors.push(
      rainbowColors[colorKeys[colorIndex] as keyof typeof rainbowColors],
    );
    repeatCount += 1;
  });

  return colors;
};

export const AnimatedText = ({
  id,
  children,
  delay = 0,
  direction = 'leftToRight',
  customTypingSpeed,
  rainbowColor,
  ...textProps
}: TextProps & {
  id?: string;
  delay?: number;
  direction?: AnimationDirection;
  customTypingSpeed?: number;
  rainbowColor?: boolean;
}) => {
  if (typeof children !== 'string') {
    console.error('AnimatedText expects a string as children');
    return null;
  }

  const characters = children.split('');
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

  const colors = generateRainbowColors(characters.join(''));

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text fontFamily="mono" {...textProps}>
      <Box
        as={motion.div}
        key={id}
        id={id}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {characters.map((char, i) => (
          <Box
            as={motion.span}
            key={(id || '') + i}
            custom={i}
            variants={charVariants}
            style={{
              color: rainbowColor ? colors?.[i]?.text : '',
              textShadow: rainbowColor
                ? `0px 0px 12px ${colors?.[i]?.shadow}`
                : undefined,
            }}
          >
            {char}
          </Box>
        ))}
      </Box>
    </Text>
  );
};
