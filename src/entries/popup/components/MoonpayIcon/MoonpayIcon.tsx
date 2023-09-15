import React from 'react';

import { Box } from '~/design-system';

export function MoonpayIcon({
  width = 18,
  height = 18,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Box
      borderRadius="round"
      boxShadow="12px"
      style={{
        overflow: 'hidden',
        height: height,
        width: width,
        background: '#7E01FF',
        padding: '3px',
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
