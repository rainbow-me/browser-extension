import React from 'react';

import { Box } from '~/design-system';
import {
  accentColorAsHsl,
  foregroundColorVars,
} from '~/design-system/styles/core.css';
import { ForegroundColor } from '~/design-system/styles/designTokens';

import { spinnerStyle } from './Spinner.css';

export function Spinner({
  size = 8,
  color,
}: {
  size?: number;
  color?: 'accent' | ForegroundColor;
}) {
  return (
    <Box
      className={spinnerStyle}
      style={{
        maskSize: `${size}px ${size}px`,
        WebkitMaskSize: `${size}px ${size}px`,
        height: size,
        width: size,
        backgroundColor:
          color === 'accent'
            ? accentColorAsHsl
            : foregroundColorVars[color || 'blue'],
      }}
    />
  );
}
