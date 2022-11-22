import * as React from 'react';

import {
  accentColorAsHsl,
  foregroundColorVars,
} from '~/design-system/styles/core.css';
import { ForegroundColor } from '~/design-system/styles/designTokens';

export type EthSymbolProps = {
  color?: 'accent' | ForegroundColor;
  size?: number;
};

export function EthSymbol({ color = 'label', size = 16 }: EthSymbolProps) {
  return (
    <svg
      viewBox="0 0 9 12"
      fill="none"
      style={{
        color:
          color === 'accent' ? accentColorAsHsl : foregroundColorVars[color],
        width: size,
        height: size,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.19531 2.71094H7.79688C8.4375 2.71094 8.88281 2.34375 8.88281 1.71875C8.88281 1.09375 8.44531 0.726562 7.79688 0.726562H1.19531C0.546875 0.726562 0.109375 1.09375 0.109375 1.71875C0.109375 2.34375 0.554688 2.71094 1.19531 2.71094ZM1.80469 7.24219H7.1875C7.78906 7.24219 8.20312 6.89844 8.20312 6.3125C8.20312 5.72656 7.79688 5.38281 7.1875 5.38281H1.80469C1.20312 5.38281 0.789062 5.72656 0.789062 6.3125C0.789062 6.89844 1.21094 7.24219 1.80469 7.24219ZM1.19531 12H7.79688C8.4375 12 8.88281 11.625 8.88281 11.0078C8.88281 10.3828 8.44531 10.0078 7.79688 10.0078H1.19531C0.546875 10.0078 0.109375 10.3828 0.109375 11.0078C0.109375 11.625 0.554688 12 1.19531 12Z"
        fill="currentColor"
      />
    </svg>
  );
}
