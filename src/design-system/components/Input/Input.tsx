import { motion } from 'framer-motion';
import React, { InputHTMLAttributes } from 'react';

import { BoxStyles, TextStyles, textStyles } from '../../styles/core.css';
import {
  BackgroundColor,
  TextColor,
  transformScales,
  transitions,
} from '../../styles/designTokens';
import { Box } from '../Box/Box';

import {
  InputHeight,
  backgroundStyle,
  heightStyles,
  placeholderStyle,
} from './Input.css';

export type InputProps = {
  'aria-label'?: InputHTMLAttributes<HTMLInputElement>['aria-label'];
  autoFocus?: InputHTMLAttributes<HTMLInputElement>['autoFocus'];
  height: InputHeight;
  onBlur?: InputHTMLAttributes<HTMLInputElement>['onBlur'];
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
  onFocus?: InputHTMLAttributes<HTMLInputElement>['onFocus'];
  placeholder?: string;
  testId?: string;
  variant: 'surface' | 'bordered' | 'transparent';
  value?: InputHTMLAttributes<HTMLInputElement>['value'];
};

export const stylesForVariant: Record<
  InputProps['variant'],
  {
    background?: {
      default: 'accent' | BackgroundColor;
      focus?: 'accent' | BackgroundColor;
      hoverActive?: 'accent' | BackgroundColor;
      hover?: 'accent' | BackgroundColor;
    };
    borderColor?: BoxStyles['borderColor'];
    textColor?: 'accent' | TextColor;
  }
> = {
  surface: {
    background: {
      default: 'surfacePrimaryElevated',
    },
    borderColor: {
      default: 'transparent',
      hover: 'transparent',
      hoverActive: 'transparent',
      focus: 'blue',
    },
    textColor: 'label',
  },
  bordered: {
    background: {
      default: 'transparent',
    },
    borderColor: {
      default: 'separator',
      hover: 'separator',
      hoverActive: 'separator',
      focus: 'blue',
    },
    textColor: 'label',
  },
  transparent: {
    borderColor: {
      default: 'transparent',
    },
    textColor: 'label',
  },
};

export const stylesForHeight: Record<
  InputProps['height'],
  {
    borderRadius: BoxStyles['borderRadius'];
    fontSize?: TextStyles['fontSize'];
    paddingHorizontal: BoxStyles['paddingHorizontal'];
  }
> = {
  '32px': {
    borderRadius: '12px',
    fontSize: '14pt',
    paddingHorizontal: '12px',
  },
};

export function Input({
  placeholder,
  height,
  variant,
  testId,
  ...inputProps
}: InputProps) {
  const { background, borderColor, textColor } = stylesForVariant[variant];
  const { borderRadius, fontSize, paddingHorizontal } = stylesForHeight[height];
  return (
    <Box
      as={motion.div}
      whileTap={
        variant !== 'transparent'
          ? { scale: transformScales['0.96'] }
          : undefined
      }
      transition={transitions.bounce}
      height="full"
      width="full"
    >
      <Box
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...inputProps}
        as="input"
        background={background}
        borderColor={borderColor}
        borderWidth="1px"
        borderRadius={borderRadius}
        className={[
          backgroundStyle,
          heightStyles[height],
          textStyles({
            color: textColor,
            fontSize,
            fontWeight: 'semibold',
            fontFamily: 'rounded',
          }),
          placeholderStyle,
        ]}
        paddingHorizontal={paddingHorizontal}
        placeholder={placeholder}
        testId={testId}
        width="full"
      />
    </Box>
  );
}
