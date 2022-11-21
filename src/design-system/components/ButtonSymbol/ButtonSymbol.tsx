import * as React from 'react';

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
} & ButtonVariantProps;

export function ButtonSymbol({ height, symbol, ...props }: ButtonSymbolProps) {
  const { textColor } = stylesForVariant({
    color: props.color ?? 'accent',
  })[props.variant];

  const { textSize } = stylesForHeight[height];

  return (
    <Box className={widthStyles[height]}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ButtonWrapper height={height} width="full" {...props}>
        <Symbol
          color={textColor}
          size={textSize?.split(' ')[0] as SymbolProps['size']}
          symbol={symbol}
          weight="bold"
        />
      </ButtonWrapper>
    </Box>
  );
}
