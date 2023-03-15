import * as React from 'react';

import { TextStyles } from '~/design-system/styles/core.css';
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
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  symbol: SymbolProps['symbol'];
  symbolColor?: TextColor;
  symbolSize?: SymbolProps['size'];
  borderRadius?: Radius;
  testId?: string;
  tabIndex?: number;
  cursor?: TextStyles['cursor'];
} & ButtonVariantProps;

export function ButtonSymbol({
  height,
  symbol,
  symbolSize,
  cursor = 'default',
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
    <Box className={widthStyles[height]} cursor={cursor}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ButtonWrapper height={height} width="full" {...props} cursor={cursor}>
        <Symbol
          color={symbolColor}
          cursor={cursor}
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
