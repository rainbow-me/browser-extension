import * as React from 'react';

import { Box } from '~/design-system';
import { FontWeight, SymbolName } from '~/design-system/styles/designTokens';

import { SymbolStyles, symbolStyles } from '../../styles/core.css';
import symbols from '../../symbols/generated';

export type SymbolProps = {
  color?: SymbolStyles['color'];
  cursor?: SymbolStyles['cursor'];
  symbol: SymbolName;
  weight: FontWeight;
  size: number;
  gradient?: React.ReactNode;
};

export function Symbol({
  color = 'label',
  cursor = 'default',
  symbol: name,
  weight,
  size,
  gradient,
}: SymbolProps) {
  const symbol = symbols[name as keyof typeof symbols][weight];

  return (
    <Box style={{ height: size, width: size }}>
      <Box
        style={{
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
          willChange: 'transform',
        }}
      >
        <svg
          cursor={cursor}
          viewBox={`0 0 ${symbol.viewBox.width} ${symbol.viewBox.height}`}
          fill="none"
          className={symbolStyles({ color })}
          style={{ width: size * 2, height: size * 2 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {gradient ? <defs>{gradient}</defs> : null}
          <path
            d={symbol.path}
            fill={gradient ? 'url(#gradient)' : 'currentColor'}
            shapeRendering="geometricPrecision"
          />
        </svg>
      </Box>
    </Box>
  );
}
