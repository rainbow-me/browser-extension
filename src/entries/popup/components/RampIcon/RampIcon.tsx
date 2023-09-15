import React from 'react';

import { Box } from '~/design-system';

export function RampIcon({
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
        background: '#21BF73',
      }}
    >
      <svg
        width={'100%'}
        height={'100%'}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill={'#FFFFFF'}
          d="m12.13 6.973-2.083 2.09a.455.455 0 0 0 0 .642L11.64 11.3a.706.706 0 0 0 .986 0l4.878-4.815a.684.684 0 0 0 0-.973L12.625.701a.705.705 0 0 0-.986 0l-1.591 1.594a.455.455 0 0 0 0 .641l2.082 2.09c.542.536.542 1.412 0 1.947ZM5.867 6.973l2.082 2.09a.455.455 0 0 1 0 .642L6.358 11.3a.706.706 0 0 1-.986 0L.493 6.484a.684.684 0 0 1 0-.973L5.372.701a.706.706 0 0 1 .986 0l1.591 1.594a.455.455 0 0 1 0 .641l-2.082 2.09a1.367 1.367 0 0 0 0 1.947Z"
        />
        <path
          fill={'#FFFFFF'}
          d="M6.413 6.398a.562.562 0 0 1 0-.796l2.188-2.187c.22-.22.576-.22.795 0l2.188 2.187c.22.22.22.576 0 .796L9.396 8.585a.562.562 0 0 1-.795 0L6.413 6.398Z"
        />
      </svg>
    </Box>
  );
}
