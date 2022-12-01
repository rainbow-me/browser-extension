import React from 'react';

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
  children: string | React.ReactNode;
  height: ButtonHeight;
  onClick?: () => void;
  width?: 'fit' | 'full';
  testId?: string;
  symbolSide?: 'left' | 'right';
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

export function Button({
  children,
  emoji,
  height,
  symbol,
  symbolSide,
  testId,
  ...props
}: ButtonProps) {
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
    <ButtonWrapper height={height} {...props}>
      <Box paddingHorizontal={paddingHorizontal} testId={testId}>
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
}
