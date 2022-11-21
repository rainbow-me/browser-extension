import { motion } from 'framer-motion';
import React, { InputHTMLAttributes } from 'react';

import { BoxStyles, TextStyles, textStyles } from '../../styles/core.css';
import { BackgroundColor, TextColor } from '../../styles/designTokens';
import { Box } from '../Box/Box';

import { backgroundStyle, heightStyles, placeholderStyle } from './Input.css';

export type InputProps = {
  'aria-label'?: InputHTMLAttributes<HTMLInputElement>['aria-label'];
  autoFocus?: InputHTMLAttributes<HTMLInputElement>['autoFocus'];
  height?: 'full' | 'fit';
  size: '34px';
  onBlur?: InputHTMLAttributes<HTMLInputElement>['onBlur'];
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
  onFocus?: InputHTMLAttributes<HTMLInputElement>['onFocus'];
  placeholder?: string;
  testId?: string;
  variant: 'fill' | 'surface' | 'transparent';
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
  fill: {
    background: {
      default: 'fillSecondary',
      focus: 'fillSecondary',
      hoverActive: 'fill',
      hover: 'fill',
    },
    borderColor: {
      default: 'transparent',
      hover: 'transparent',
      hoverActive: 'transparent',
      focus: 'blue',
    },
    textColor: 'label',
  },
  surface: {
    background: {
      default: 'surfacePrimary',
      focus: 'surfacePrimary',
      hoverActive: 'surfacePrimaryElevated',
      hover: 'surfacePrimaryElevated',
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

export const stylesForSize: Record<
  InputProps['size'],
  {
    borderRadius: BoxStyles['borderRadius'];
    fontSize?: TextStyles['fontSize'];
    paddingHorizontal: BoxStyles['paddingHorizontal'];
  }
> = {
  '34px': {
    borderRadius: '12px',
    fontSize: '14pt',
    paddingHorizontal: '12px',
  },
};

export function Input({
  placeholder,
  height = 'fit',
  variant,
  size,
  testId,
  ...inputProps
}: InputProps) {
  const { background, borderColor, textColor } = stylesForVariant[variant];
  const { borderRadius, fontSize, paddingHorizontal } = stylesForSize[size];
  return (
    <Box
      as={motion.div}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', mass: 0.1, stiffness: 500, damping: 20 }}
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
          heightStyles[height === 'full' ? 'full' : size],
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
