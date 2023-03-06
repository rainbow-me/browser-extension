import * as React from 'react';

import { Radius, TextColor } from '~/design-system/styles/designTokens';

import { Box } from '../Box/Box';
import {
  ButtonVariantProps,
  ButtonWrapper,
  stylesForHeight,
  stylesForVariant,
} from '../Button/ButtonWrapper';
import { ButtonHeight } from '../Button/ButtonWrapper.css';
import { Symbol, SymbolProps } from '../Symbol/Symbol';

import { widthStyles } from './ButtonSymbol.css';

export type ButtonSymbolProps = {
  height: ButtonHeight;
  onClick?: () => void;
  symbol: SymbolProps['symbol'];
  symbolColor?: TextColor;
  symbolSize?: SymbolProps['size'];
  borderRadius?: Radius;
  testId?: string;
  tabIndex?: number;
} & ButtonVariantProps;

export function ButtonSymbol({
  height,
  symbol,
  symbolSize,
  ...props
}: ButtonSymbolProps) {
  const { textColor: textColorFromVariant } = stylesForVariant({
    color: props.color ?? 'accent',
  })[props.variant];
  let symbolColor = textColorFromVariant;
  if (props.symbolColor) {
    symbolColor = props.symbolColor;
  }

  const { textSize } = stylesForHeight[height];

  return (
    <Box className={widthStyles[height]}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ButtonWrapper height={height} width="full" {...props}>
        <Symbol
          color={symbolColor}
          size={
            symbolSize ??
            (parseInt(
              textSize?.split(' ')[0].replace('pt', '') ?? '',
            ) as SymbolProps['size'])
          }
          symbol={symbol}
          weight="bold"
        />
      </ButtonWrapper>
    </Box>
  );
}
