import { motion } from 'framer-motion';
import React from 'react';

import { BoxStyles, ShadowSize, TextStyles } from '../../styles/core.css';
import {
  BackgroundColor,
  ButtonColor,
  Space,
  TextColor,
} from '../../styles/designTokens';
import { Box } from '../Box/Box';
import { Inline } from '../Inline/Inline';
import { Text } from '../Text/Text';

import { ButtonHeight, heightStyles, tintedStyles } from './Button.css';

export type ButtonProps = {
  children: string | React.ReactNode;
  height: ButtonHeight;
  // TODO: support SF symbols
  icon?: string;
  onClick?: () => void;
  width?: 'fit' | 'full';
} & (
  | {
      color: ButtonColor;
      variant: 'raised' | 'flat' | 'tinted' | 'stroked' | 'transparent';
    }
  | {
      color?: never;
      variant: 'white';
    }
);

const shadowValue = (size: ShadowSize, color?: ButtonColor) =>
  color ? (`${size} ${color}` as const) : size;

const stylesForHeight: Record<
  ButtonProps['height'],
  {
    gap?: Space;
    paddingHorizontal?: BoxStyles['paddingHorizontal'];
    textSize?: TextStyles['fontSize'];
  }
> = {
  '44px': {
    gap: '8px',
    paddingHorizontal: '24px',
    textSize: '16pt',
  },
  '36px': {
    gap: '6px',
    paddingHorizontal: '16px',
    textSize: '16pt',
  },
  '32px': {
    gap: '6px',
    paddingHorizontal: '12px',
    textSize: '14pt',
  },
  '28px': {
    gap: '6px',
    paddingHorizontal: '10px',
    textSize: '14pt',
  },
  '24px': {
    gap: '6px',
    paddingHorizontal: '10px',
    textSize: '11pt',
  },
};

const stylesForHeightAndVariant = ({
  color,
}: {
  color?: ButtonColor;
}): Record<
  ButtonHeight,
  Record<
    ButtonProps['variant'],
    {
      boxShadow?: BoxStyles['boxShadow'];
    }
  >
> => ({
  '44px': {
    raised: { boxShadow: shadowValue('30px', color) },
    flat: {},
    tinted: {},
    stroked: {},
    transparent: {},
    white: {
      boxShadow: shadowValue('30px', color),
    },
  },
  '36px': {
    raised: { boxShadow: shadowValue('24px', color) },
    flat: {},
    tinted: {},
    stroked: {},
    transparent: {},
    white: {
      boxShadow: shadowValue('24px', color),
    },
  },
  '32px': {
    raised: { boxShadow: shadowValue('24px', color) },
    flat: {},
    tinted: {},
    stroked: {},
    transparent: {},
    white: {
      boxShadow: shadowValue('24px', color),
    },
  },
  '28px': {
    raised: { boxShadow: shadowValue('12px', color) },
    flat: {},
    tinted: {},
    stroked: {},
    transparent: {},
    white: {
      boxShadow: shadowValue('12px', color),
    },
  },
  '24px': {
    raised: { boxShadow: shadowValue('12px', color) },
    flat: {},
    tinted: {},
    stroked: {},
    transparent: {},
    white: {
      boxShadow: shadowValue('12px', color),
    },
  },
});

const stylesForVariant = ({
  color,
}: {
  color: ButtonColor;
}): Record<
  ButtonProps['variant'],
  {
    background?: 'accent' | BackgroundColor;
    textColor?: 'accent' | TextColor;
    borderColor?: BoxStyles['borderColor'];
    borderWidth?: BoxStyles['borderWidth'];
  }
> => ({
  raised: {
    background: color,
    borderColor: 'buttonStroke',
    borderWidth: '1px',
  },
  flat: {
    background: color,
    borderColor: 'buttonStroke',
    borderWidth: '1px',
  },
  tinted: {
    textColor: color as TextColor,
  },
  stroked: {
    borderColor: color,
    borderWidth: '2px',
    textColor: 'labelSecondary',
  },
  transparent: {
    textColor: color as TextColor,
  },
  white: {
    background: 'white',
  },
});

export function Button({
  children,
  color,
  height,
  icon,
  onClick,
  variant,
  width = 'fit',
}: ButtonProps) {
  const { boxShadow } = stylesForHeightAndVariant({
    color,
  })[height][variant];

  const { background, borderColor, borderWidth, textColor } = stylesForVariant({
    color: color ?? 'accent',
  })[variant];

  const { gap, paddingHorizontal, textSize } = stylesForHeight[height];

  return (
    <Box
      as={motion.div}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', mass: 0.1, stiffness: 500, damping: 20 }}
      width={width}
    >
      <Box
        as="button"
        alignItems="center"
        background={background}
        borderRadius="round"
        borderColor={borderColor}
        borderWidth={borderWidth}
        boxShadow={boxShadow}
        className={[
          heightStyles[height],
          variant === 'tinted' && tintedStyles[color || 'accent'],
        ]}
        display="flex"
        onClick={onClick}
        position="relative"
        justifyContent="center"
        paddingHorizontal={paddingHorizontal}
        width={width}
      >
        {typeof children === 'string' ? (
          <Inline alignVertical="center" space={gap}>
            {icon && (
              <Text color={textColor} size={textSize} weight="bold">
                {icon}
              </Text>
            )}
            <Text color={textColor} size={textSize} weight="bold">
              {children}
            </Text>
          </Inline>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}
