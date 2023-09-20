import React from 'react';

import { Box } from '~/design-system';

export function MoonpayIcon({
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
        background: showBackground ? '#7E01FF' : undefined,
        padding: showBackground ? '3px' : undefined,
      }}
    >
      <svg
        width={'100%'}
        height={'100%'}
        viewBox={`0 0 865 865`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill={'#ffffff'}
          d="M620.65 329.071a82.51 82.51 0 1 0-76.23-50.933 82.496 82.496 0 0 0 76.23 50.933ZM367.655 700.674a201.12 201.12 0 0 1-185.809-124.153 201.113 201.113 0 0 1 146.573-274.218 201.118 201.118 0 1 1 39.236 398.371Z"
        />
      </svg>
    </Box>
  );
}
