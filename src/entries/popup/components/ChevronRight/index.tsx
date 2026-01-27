import React from 'react';

import { foregroundColorVars } from '~/design-system/styles/core.css';
import { ForegroundColor } from '~/design-system/styles/designTokens';

export function ChevronRight({
  width = 6,
  height = 17,
  color = 'label',
  opacity = 1,
  strokeWidth = 2,
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
      viewBox={`0 0 6 17`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.71265 1.47559L4.93172 7.14151C5.41033 7.98392 5.41033 9.01603 4.93172 9.85844L1.71265 15.5244"
        stroke={foregroundColorVars[color]}
        strokeOpacity={opacity}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
