import { motion } from 'framer-motion';
import React, { forwardRef } from 'react';

import {
  BoxStyles,
  ShadowSize,
  TextStyles,
  accentColorAsHsl,
  foregroundColorVars,
  transparentAccentColorAsHsl20,
} from '../../styles/core.css';
import {
  BackgroundColor,
  ButtonColor,
  ButtonVariant,
  Radius,
  Space,
  TextColor,
  transformScales,
  transitions,
} from '../../styles/designTokens';
import { Box } from '../Box/Box';

import { ButtonHeight, heightStyles, tintedStyles } from './ButtonWrapper.css';

export type ButtonVariantProps =
  | {
      color: BackgroundColor | ButtonColor | TextColor;
      variant: ButtonVariant;
    }
  | {
      color?: never;
      variant: 'white';
    };

export type ButtonWrapperProps = {
  autoFocus?: boolean;
  children: string | React.ReactNode;
  cursor?: BoxStyles['cursor'];
  height: ButtonHeight;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  width?: 'fit' | 'full';
  blur?: string;
  borderRadius?: Radius;
  tabIndex?: number;
  disabled?: boolean;
  testId?: string;
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
  '30px': {
    gap: '6px',
    paddingHorizontal: '10px',
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
    plain: {},
    tinted: {},
    stroked: {},
    disabled: {},
    transparent: {},
    transparentHover: {},
    white: {
      boxShadow: shadowValue('30px', color),
    },
    square: {},
    shadow: {
      boxShadow: shadowValue('30px', color),
    },
  },
  '36px': {
    raised: { boxShadow: shadowValue('24px', color) },
    flat: {},
    plain: {},
    tinted: {},
    stroked: {},
    disabled: {},
    transparent: {},
    transparentHover: {},
    white: {
      boxShadow: shadowValue('24px', color),
    },
    square: {},
    shadow: {
      boxShadow: shadowValue('24px', color),
    },
  },
  '32px': {
    raised: { boxShadow: shadowValue('24px', color) },
    flat: {},
    plain: {},
    tinted: {},
    stroked: {},
    disabled: {},
    transparent: {},
    transparentHover: {},
    white: {
      boxShadow: shadowValue('24px', color),
    },
    square: {},
    shadow: {
      boxShadow: shadowValue('24px', color),
    },
  },
  '30px': {
    raised: { boxShadow: shadowValue('24px', color) },
    flat: {},
    plain: {},
    tinted: {},
    stroked: {},
    disabled: {},
    transparent: {},
    transparentHover: {},
    white: {
      boxShadow: shadowValue('24px', color),
    },
    square: {},
    shadow: {
      boxShadow: shadowValue('24px', color),
    },
  },
  '28px': {
    raised: { boxShadow: shadowValue('12px', color) },
    flat: {},
    plain: {},
    tinted: {},
    stroked: {},
    disabled: {},
    transparent: {},
    transparentHover: {},
    white: {
      boxShadow: shadowValue('12px', color),
    },
    square: {},
    shadow: {
      boxShadow: shadowValue('12px', color),
    },
  },
  '24px': {
    raised: { boxShadow: shadowValue('12px', color) },
    flat: {},
    plain: {},
    tinted: {},
    stroked: {},
    disabled: {},
    transparent: {},
    transparentHover: {},
    white: {
      boxShadow: shadowValue('12px', color),
    },
    square: {},
    shadow: {
      boxShadow: shadowValue('12px', color),
    },
  },
});

export const stylesForVariant = ({
  color,
}: {
  color: BackgroundColor | ButtonColor | TextColor;
}): Record<
  ButtonWrapperProps['variant'],
  {
    background?: 'accent' | BackgroundColor;
    textColor?: 'accent' | TextColor;
    borderColor?: BoxStyles['borderColor'];
    borderWidth?: BoxStyles['borderWidth'];
    backgroundColor?: string;
  }
> => ({
  raised: {
    background: color as ButtonColor,
    borderColor: 'buttonStroke',
    borderWidth: '1px',
  },
  flat: {
    background: color as ButtonColor,
    borderColor: 'buttonStroke',
    borderWidth: '1px',
  },
  plain: {
    background: color as ButtonColor,
  },
  tinted: {
    textColor: color as TextColor,
  },
  stroked: {
    borderColor: color as ButtonColor,
    borderWidth: '2px',
    textColor: 'labelSecondary',
  },
  shadow: {
    borderColor: color as ButtonColor,
    borderWidth: '2px',
    textColor: 'labelSecondary',
    backgroundColor: transparentAccentColorAsHsl20,
  },
  transparent: {
    textColor: color as TextColor,
  },
  transparentHover: {
    textColor: color as TextColor,
  },
  white: {
    background: 'white',
  },
  disabled: {
    borderColor: 'separatorSecondary',
    borderWidth: '2px',
    textColor: color as TextColor,
  },
  square: {
    borderColor: color as ButtonColor,
    borderWidth: '1px',
    textColor: 'label',
  },
});

export const ButtonWrapper = forwardRef<HTMLButtonElement, ButtonWrapperProps>(
  (
    {
      autoFocus,
      children,
      cursor = 'default',
      color,
      height,
      onClick,
      variant,
      width = 'fit',
      blur = '',
      borderRadius,
      tabIndex,
      disabled,
      testId,
    }: ButtonWrapperProps,
    ref,
  ) => {
    const { boxShadow } = stylesForHeightAndVariant({
      color: color as ButtonColor,
    })[height][variant];

    const { background, borderColor, borderWidth, backgroundColor } =
      stylesForVariant({
        color: color ?? 'accent',
      })[variant];

    let outlineColor = undefined;
    // Only apply outline to buttons with tabIndex
    if (tabIndex !== undefined) {
      outlineColor =
        color && color !== 'accent' && color !== 'transparent'
          ? foregroundColorVars[color as TextColor] || accentColorAsHsl
          : accentColorAsHsl;
    }
    const styles = {
      ...((blur && { backdropFilter: `blur(${blur})` }) || {}),
      outlineColor,
      ...(backgroundColor ? { backgroundColor } : {}),
    };

    return (
      <Box
        as={motion.div}
        initial={{ zIndex: 0 }}
        whileHover={{ scale: disabled ? undefined : transformScales['1.04'] }}
        whileTap={{ scale: disabled ? undefined : transformScales['0.96'] }}
        transition={transitions.bounce}
        width={width}
        className="bx-button-wrapper"
      >
        <Box
          as="button"
          alignItems="center"
          background={
            variant === 'transparentHover'
              ? {
                  default: background || 'transparent',
                  hover: 'surfaceSecondaryElevated',
                }
              : background
          }
          borderRadius={borderRadius ?? 'round'}
          borderColor={
            variant === 'transparentHover'
              ? { default: 'transparent', hover: 'buttonStroke' }
              : borderColor
          }
          borderWidth={variant === 'transparentHover' ? '1px' : borderWidth}
          boxShadow={boxShadow}
          className={[
            heightStyles[height],
            variant === 'tinted' &&
              tintedStyles[(color as ButtonColor) || 'accent'],
          ]}
          display="flex"
          onClick={onClick}
          disabled={disabled}
          position="relative"
          justifyContent="center"
          width={width}
          style={styles}
          tabIndex={tabIndex}
          testId={testId}
          cursor={cursor}
          ref={ref}
          autoFocus={autoFocus}
        >
          {children}
        </Box>
      </Box>
    );
  },
);

ButtonWrapper.displayName = 'ButtonWrapper';
