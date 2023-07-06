import React, { forwardRef } from 'react';

import { BoxStyles } from '~/design-system/styles/core.css';
import { Radius } from '~/design-system/styles/designTokens';

import { Box } from '../Box/Box';
import { Inline } from '../Inline/Inline';
import { Symbol, SymbolProps } from '../Symbol/Symbol';
import { Text } from '../Text/Text';

import {
  ButtonVariantProps,
  ButtonWrapper,
  stylesForHeight,
  stylesForVariant,
} from './ButtonWrapper';
import { ButtonHeight } from './ButtonWrapper.css';

export type ButtonProps = {
  autoFocus?: boolean;
  children: string | React.ReactNode;
  height: ButtonHeight;
  onClick?: () => void;
  width?: 'fit' | 'full';
  testId?: string;
  symbolSide?: 'left' | 'right';
  blur?: string;
  borderRadius?: Radius;
  paddingLeft?: BoxStyles['paddingLeft'];
  paddingRight?: BoxStyles['paddingRight'];
  tabIndex?: number;
  disabled?: boolean;
} & ButtonVariantProps &
  (
    | {
        emoji?: string;
        symbol?: never;
      }
    | {
        emoji?: never;
        symbol?: SymbolProps['symbol'];
      }
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      emoji,
      height,
      symbol,
      symbolSide,
      testId,
      ...props
    }: ButtonProps,
    ref,
  ) => {
    const { textColor } = stylesForVariant({
      color: props.color ?? 'accent',
    })[props.variant];

    const { paddingHorizontal, gap, textSize } = stylesForHeight[height];

    const symbolComponent =
      (symbol && (
        <Symbol
          color={textColor}
          size={
            parseInt(
              textSize?.split(' ')[0].replace('pt', '') ?? '',
            ) as SymbolProps['size']
          }
          symbol={symbol}
          weight="bold"
        />
      )) ||
      null;

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <ButtonWrapper height={height} {...props} testId={testId} ref={ref}>
        <Box
          paddingLeft={props.paddingLeft || paddingHorizontal}
          paddingRight={props.paddingRight || paddingHorizontal}
        >
          {typeof children === 'string' ? (
            <Inline alignVertical="center" space={gap}>
              {emoji && (
                <Text color={textColor} size={textSize} weight="bold">
                  {emoji}
                </Text>
              )}
              {symbolSide !== 'right' && symbolComponent}
              <Text color={textColor} size={textSize} weight="bold">
                {children}
              </Text>
              {symbolSide === 'right' && symbolComponent}
            </Inline>
          ) : (
            children
          )}
        </Box>
      </ButtonWrapper>
    );
  },
);

Button.displayName = 'Button';
