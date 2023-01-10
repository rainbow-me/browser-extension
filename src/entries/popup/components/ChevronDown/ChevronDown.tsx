import React from 'react';

import { foregroundColorVars } from '~/design-system/styles/core.css';
import { ForegroundColor } from '~/design-system/styles/designTokens';

export function ChevronDown({
  width = 18,
  height = 10,
  color = 'label',
}: {
  width?: number;
  height?: number;
  color?: ForegroundColor;
  opacity?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill={foregroundColorVars[color]}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.58301 8.8291C8.90039 8.8291 9.16064 8.71484 9.4082 8.45459L14.1118 3.65576C14.3022 3.46533 14.3975 3.23047 14.3975 2.95117C14.3975 2.39258 13.9404 1.93555 13.3882 1.93555C13.1089 1.93555 12.8486 2.0498 12.6455 2.25928L8.58936 6.44238L4.52686 2.25928C4.31738 2.0498 4.06348 1.93555 3.77783 1.93555C3.21924 1.93555 2.76855 2.39258 2.76855 2.95117C2.76855 3.23047 2.86377 3.46533 3.0542 3.65576L7.75781 8.45459C8.01172 8.72119 8.27197 8.8291 8.58301 8.8291Z" />
    </svg>
  );
}
