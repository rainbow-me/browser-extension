import * as React from 'react';

import { FontWeight, SymbolName } from '~/design-system/styles/designTokens';

import { SymbolStyles, symbolStyles } from '../../styles/core.css';
import symbols from '../../symbols/generated';

export type SymbolProps = {
  color?: SymbolStyles['color'];
  symbol: SymbolName;
  weight: FontWeight;
  size: number;
  gradient?: React.ReactNode;
};

export function Symbol({
  color = 'label',
  symbol: name,
  weight,
  size,
  gradient,
}: SymbolProps) {
  const symbol = symbols[name as keyof typeof symbols][weight];

  return (
    <svg
      viewBox={`0 0 ${symbol.viewBox.width} ${symbol.viewBox.height}`}
      fill="none"
      className={symbolStyles({ color })}
      style={{ width: size, height: size }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {gradient ? <defs>{gradient}</defs> : null}
      <path
        d={symbol.path}
        fill={gradient ? 'url(#gradient)' : 'currentColor'}
      />
    </svg>
  );
}
