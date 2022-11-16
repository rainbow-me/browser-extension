import mapValues from 'lodash/mapValues';
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

const gapForHeight: Record<ButtonProps['height'], Space> = {
  '24px': '6px',
  '28px': '6px',
  '32px': '6px',
  '36px': '6px',
  '44px': '8px',
};

const paddingHorizontalForHeight: Record<
  ButtonProps['height'],
  BoxStyles['paddingHorizontal']
> = {
  '24px': '10px',
  '28px': '10px',
  '32px': '12px',
  '36px': '16px',
  '44px': '24px',
};

const shadowSizesForHeight: Record<ButtonProps['height'], ShadowSize> = {
  '24px': '12px',
  '28px': '12px',
  '32px': '24px',
  '36px': '24px',
  '44px': '30px',
};
const shadowValueForHeight = ({
  color,
}: {
  color: ButtonProps['color'];
}): Record<keyof typeof shadowSizesForHeight, BoxStyles['boxShadow']> =>
  mapValues(shadowSizesForHeight, (size) =>
    color ? (`${size} ${color}` as const) : (`${size}` as const),
  );

const buttonStylesForVariant = ({
  color = 'accent',
  boxShadow,
}: {
  color?: ButtonProps['color'];
  boxShadow: BoxStyles['boxShadow'];
}): Record<
  ButtonProps['variant'],
  {
    background?: 'accent' | BackgroundColor;
    boxShadow?: BoxStyles['boxShadow'];
    borderWidth?: BoxStyles['borderWidth'];
    borderColor?: BoxStyles['borderColor'];
  }
> => ({
  raised: {
    background: color,
    boxShadow,
  },
  flat: {
    background: color,
  },
  tinted: {},
  stroked: {
    borderColor: color,
    borderWidth: '2px',
  },
  white: {
    background: 'white',
    boxShadow,
  },
  transparent: {},
});

const fontSizesForHeight: Record<
  ButtonProps['height'],
  TextStyles['fontSize']
> = {
  '24px': '11pt',
  '28px': '14pt',
  '32px': '14pt',
  '36px': '16pt',
  '44px': '16pt',
};

const textStylesForVariant = ({
  color = 'accent',
}: {
  color?: ButtonProps['color'];
}): Record<
  ButtonProps['variant'],
  {
    color?: 'accent' | TextColor;
  }
> => ({
  raised: {},
  flat: {},
  tinted: {
    color,
  },
  white: {},
  stroked: {
    color: 'labelSecondary',
  },
  transparent: {
    color,
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
  const boxShadow = shadowValueForHeight({ color })[height];
  const buttonStyles = buttonStylesForVariant({ color, boxShadow })[variant];
  const paddingHorizontal = paddingHorizontalForHeight[height];
  const fontSize = fontSizesForHeight[height];
  const textStyles = textStylesForVariant({ color })[variant];
  return (
    <Box
      as="button"
      alignItems="center"
      background={buttonStyles.background}
      borderRadius="round"
      borderColor={buttonStyles.borderColor}
      borderWidth={buttonStyles.borderWidth}
      boxShadow={buttonStyles.boxShadow}
      className={[
        heightStyles[height],
        variant === 'tinted' && tintedStyles[color || 'accent'],
        interactionStyles,
      ]}
      display="flex"
      onClick={onClick}
      position="relative"
      justifyContent="center"
      paddingHorizontal={paddingHorizontal}
      width="fit"
    >
      {typeof children === 'string' ? (
        <Inline alignVertical="center" space={gapForHeight[height]}>
          {icon && (
            <Text color={textStyles.color} size={fontSize} weight="bold">
              {icon}
            </Text>
          )}
          <Text color={textStyles.color} size={fontSize} weight="bold">
            {children}
          </Text>
        </Inline>
      ) : (
        children
      )}
    </Box>
  );
}
