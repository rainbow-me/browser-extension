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
  ...props
}: ButtonProps) {
  const { textColor } = stylesForVariant({
    color: props.color ?? 'accent',
  })[props.variant];

  const { paddingHorizontal, gap, textSize } = stylesForHeight[height];

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ButtonWrapper height={height} {...props}>
      <Box paddingHorizontal={paddingHorizontal}>
        {typeof children === 'string' ? (
          <Inline alignVertical="center" space={gap}>
            {emoji && (
              <Text color={textColor} size={textSize} weight="bold">
                {emoji}
              </Text>
            )}
            {symbol && (
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
            )}
            <Text color={textColor} size={textSize} weight="bold">
              {children}
            </Text>
          </Inline>
        ) : (
          children
        )}
      </Box>
    </ButtonWrapper>
  );
}
