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

import {
  ButtonHeight,
  heightStyles,
  interactionStyles,
  tintedStyles,
} from './Button.css';

export type ButtonProps = {
  children: string | React.ReactNode;
  height: ButtonHeight;
  // TODO: support SF symbols
  icon?: string;
  onClick?: () => void;
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
  raised: { background: color },
  flat: {
    background: color,
  },
  tinted: {
    textColor: color,
  },
  stroked: {
    borderColor: color,
    borderWidth: '2px',
    textColor: 'labelSecondary',
  },
  transparent: {
    textColor: color,
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
      as="button"
      alignItems="center"
      background={background}
      borderRadius="round"
      borderColor={borderColor}
      borderWidth={borderWidth}
      boxShadow={boxShadow}
      className={[
        heightStyles[height],
        interactionStyles,
        variant === 'tinted' && tintedStyles[color || 'accent'],
      ]}
      display="flex"
      onClick={onClick}
      position="relative"
      justifyContent="center"
      paddingHorizontal={paddingHorizontal}
      width="fit"
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
  );
}
