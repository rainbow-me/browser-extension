import { motion } from 'framer-motion';
import React from 'react';

import { BoxStyles, ShadowSize, TextStyles } from '../../styles/core.css';
import {
  BackgroundColor,
  ButtonColor,
  Space,
  TextColor,
  transformScales,
  transitions,
} from '../../styles/designTokens';
import { Box } from '../Box/Box';

import { ButtonHeight, heightStyles, tintedStyles } from './ButtonWrapper.css';

export type ButtonVariantProps =
  | {
      color: ButtonColor;
      variant: 'raised' | 'flat' | 'tinted' | 'stroked' | 'transparent';
    }
  | {
      color?: never;
      variant: 'white';
    };

export type ButtonWrapperProps = {
  children: string | React.ReactNode;
  height: ButtonHeight;
  onClick?: () => void;
  width?: 'fit' | 'full';
} & ButtonVariantProps;

const shadowValue = (size: ShadowSize, color?: ButtonColor) =>
  color ? (`${size} ${color}` as const) : size;

export const stylesForHeight: Record<
  ButtonWrapperProps['height'],
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

export const stylesForHeightAndVariant = ({
  color,
}: {
  color?: ButtonColor;
}): Record<
  ButtonHeight,
  Record<
    ButtonWrapperProps['variant'],
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

export const stylesForVariant = ({
  color,
}: {
  color: ButtonColor;
}): Record<
  ButtonWrapperProps['variant'],
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
  },
  transparent: {
    textColor: color as TextColor,
  },
  white: {
    background: 'white',
  },
});

export function ButtonWrapper({
  children,
  color,
  height,
  onClick,
  variant,
  width = 'fit',
}: ButtonWrapperProps) {
  const { boxShadow } = stylesForHeightAndVariant({
    color,
  })[height][variant];

  const { background, borderColor, borderWidth } = stylesForVariant({
    color: color ?? 'accent',
  })[variant];

  return (
    <Box
      as={motion.div}
      whileHover={{ scale: transformScales['1.04'] }}
      whileTap={{ scale: transformScales['0.96'] }}
      transition={transitions.bounce}
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
        width={width}
      >
        {children}
      </Box>
    </Box>
  );
}
