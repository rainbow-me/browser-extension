import { motion } from 'framer-motion';
import React, { CSSProperties, InputHTMLAttributes } from 'react';

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
  accentSelectionStyle,
  backgroundStyle,
  heightStyles,
  placeholderStyle,
} from './Input.css';

export type InputProps = {
  'aria-label'?: InputHTMLAttributes<HTMLInputElement>['aria-label'];
  autoFocus?: InputHTMLAttributes<HTMLInputElement>['autoFocus'];
  disabled?: boolean;
  height: InputHeight;
  onBlur?: InputHTMLAttributes<HTMLInputElement>['onBlur'];
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
  onFocus?: InputHTMLAttributes<HTMLInputElement>['onFocus'];
  onKeyDown?: InputHTMLAttributes<HTMLInputElement>['onKeyDown'];
  placeholder?: string;
  borderColor?: BoxStyles['borderColor'];
  testId?: string;
  variant: 'surface' | 'bordered' | 'transparent' | 'tinted';
  value?: InputHTMLAttributes<HTMLInputElement>['value'];
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  innerRef?: React.Ref<HTMLInputElement>;
  selectionColor?: BoxStyles['borderColor'];
  style?: CSSProperties;
  enableTapScale?: boolean;
  textAlign?: TextStyles['textAlign'];
  tabIndex?: number;
  id?: string;
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
  tinted: {
    borderColor: {
      default: 'transparent',
    },
    textColor: 'accent',
  },
};

export const stylesForHeight: Record<
  InputProps['height'],
  {
    borderRadius: BoxStyles['borderRadius'];
    fontSize?: TextStyles['fontSize'];
    paddingHorizontal: BoxStyles['paddingHorizontal'];
    paddingVertical: BoxStyles['paddingVertical'];
  }
> = {
  '32px': {
    borderRadius: '12px',
    fontSize: '14pt',
    paddingHorizontal: '12px',
    paddingVertical: '12px',
  },
  '34px': {
    borderRadius: '12px',
    fontSize: '14pt',
    paddingHorizontal: '12px',
    paddingVertical: '12px',
  },
  '40px': {
    borderRadius: '12px',
    fontSize: '14pt',
    paddingHorizontal: '12px',
    paddingVertical: '12px',
  },
  '44px': {
    borderRadius: '12px',
    fontSize: '20pt',
    paddingHorizontal: '12px',
    paddingVertical: '12px',
  },
  '56px': {
    borderRadius: '14px',
    fontSize: '23pt',
    paddingHorizontal: '16px',
    paddingVertical: '16px',
  },
};

export function Input({
  disabled,
  placeholder,
  height,
  variant,
  testId,
  innerRef,
  borderColor,
  textAlign,
  enableTapScale = true,
  ...inputProps
}: InputProps) {
  const {
    background,
    borderColor: borderColorFromVariant,
    textColor,
  } = stylesForVariant[variant];
  const { borderRadius, fontSize, paddingHorizontal, paddingVertical } =
    stylesForHeight[height];
  return (
    <Box
      as={motion.div}
      whileTap={
        variant !== 'transparent' && enableTapScale
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
        autoComplete="off"
        tabIndex={inputProps.tabIndex ?? undefined}
        ref={innerRef}
        background={background}
        borderColor={borderColor ? borderColor : borderColorFromVariant}
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
            textAlign,
          }),
          placeholderStyle,
          borderColor === 'accent' ? accentSelectionStyle : null,
        ]}
        paddingHorizontal={paddingHorizontal}
        paddingVertical={paddingVertical}
        placeholder={placeholder}
        testId={testId}
        width="full"
        disabled={disabled}
      />
    </Box>
  );
}
