import React from 'react';

import { Box } from '~/design-system';

export function WalletIcon({
  width = 18,
  height = 18,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Box
      style={{
        overflow: 'hidden',
        height: height,
        width: width,
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
        <rect
          width="16.364"
          height="13.091"
          x=".818"
          y="2.455"
          fill="url(#a)"
          rx="2.864"
        />
        <path
          fill="#0E76FD"
          d="M10.636 9a2.455 2.455 0 0 1 2.455-2.455h3.6c.458 0 .687 0 .862.09.154.078.28.203.358.357.089.175.089.404.089.863v2.29c0 .459 0 .688-.09.863a.818.818 0 0 1-.357.357c-.175.09-.404.09-.862.09h-3.6A2.455 2.455 0 0 1 10.636 9Z"
        />
        <circle cx="13.091" cy="9" r="1.023" fill="#A3D7FF" />
        <defs>
          <radialGradient
            id="a"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(0 13.09 -26.864 0 8.96 2.455)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3E3F40" />
            <stop offset=".958" stopColor="#333334" />
          </radialGradient>
        </defs>
      </svg>
    </Box>
  );
}
