import React from 'react';

import { Box } from '~/design-system';

export function CoinbaseIcon({
  showBackground,
  width = 18,
  height = 18,
}: {
  showBackground?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <Box
      alignItems="center"
      borderRadius={showBackground ? 'round' : undefined}
      boxShadow={showBackground ? '12px' : undefined}
      display="flex"
      justifyContent="center"
      style={{
        overflow: 'hidden',
        height: height,
        width: width,
      }}
    >
      <svg
        width={'100%'}
        height={'100%'}
        viewBox={`0 0 18 18`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {showBackground && <path fill="#0052FE" d="M0 0h18v18H0z" />}
        <path
          fill="#fff"
          d="M9.026 12a3.006 3.006 0 0 1-3.013-3c0-1.657 1.349-3 3.013-3a3.01 3.01 0 0 1 2.908 2.25H15A6.009 6.009 0 0 0 9.026 3C5.696 3 3 5.685 3 9s2.697 6 6.026 6A6.009 6.009 0 0 0 15 9.75h-3.066A3.01 3.01 0 0 1 9.026 12Z"
        />
      </svg>
    </Box>
  );
}
