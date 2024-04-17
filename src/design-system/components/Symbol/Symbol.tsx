import * as React from 'react';

import { FontWeight, SymbolName } from '~/design-system/styles/designTokens';

import { SymbolStyles, symbolStyles } from '../../styles/core.css';
import symbols from '../../symbols/generated';
import { Box } from '../Box/Box';

import { boxedStyle } from './Symbol.css';

export type SymbolProps = {
  boxed?: boolean;
  color?: SymbolStyles['color'];
  cursor?: SymbolStyles['cursor'];
  disableSmoothing?: boolean;
  symbol: SymbolName;
  weight?: FontWeight;
  size: number;
  gradient?: React.ReactNode;
  filter?: SymbolStyles['filter'];
};

export const Symbol = React.forwardRef<SVGSVGElement, SymbolProps>(
  function Symbol(
    {
      boxed = false,
      color = 'label',
      cursor = 'default',
      disableSmoothing,
      symbol: name,
      weight = 'bold',
      size,
      gradient,
      filter,
    },
    ref,
  ) {
    const symbol = symbols[name][weight];

    return (
      <Box
        style={{
          ...(boxed
            ? {
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
              }
            : { height: size, width: size }),
        }}
        className={boxed && boxedStyle}
      >
        <Box
          style={{
            ...(boxed
              ? {
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  transform: disableSmoothing ? 'none' : 'scale(0.5)',
                }
              : {
                  transform: disableSmoothing ? 'none' : 'scale(0.5)',
                  transformOrigin: 'top left',
                  willChange: 'transform',
                }),
          }}
        >
          <svg
            cursor={cursor}
            viewBox={`0 0 ${symbol.viewBox.width} ${symbol.viewBox.height}`}
            fill="none"
            className={symbolStyles({ color, filter })}
            ref={ref}
            style={{
              width: disableSmoothing ? size : size * 2,
              height: disableSmoothing ? size : size * 2,
            }}
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
  },
);
