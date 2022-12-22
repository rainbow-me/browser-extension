import React from 'react';

import { Box } from '~/design-system';

import { spinnerStyle } from './Spinner.css';

export function Spinner({ size = 8 }) {
  return (
    <Box
      className={spinnerStyle}
      style={{
        maskSize: `${size}px ${size}px`,
        WebkitMaskSize: `${size}px ${size}px`,
        height: size,
        width: size,
      }}
    />
  );
}
