import * as React from 'react';

import { FontWeight, SymbolName } from '~/design-system/styles/designTokens';

import { SymbolStyles, symbolStyles } from '../../styles/core.css';
import symbols from '../../symbols/generated';

export type SymbolProps = {
  color?: SymbolStyles['color'];
  symbol: SymbolName;
  weight: FontWeight;
  size: SymbolStyles['size'];
};

export function Symbol({
  color = 'label',
  symbol: name,
  weight,
  size,
}: SymbolProps) {
  const symbol = symbols[name as keyof typeof symbols][weight];
  return (
    <svg
      viewBox={`0 0 ${symbol.viewBox.width} ${symbol.viewBox.height}`}
      fill="none"
      className={symbolStyles({ color, size })}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={symbol.path} fill="currentColor" />
    </svg>
  );
}
