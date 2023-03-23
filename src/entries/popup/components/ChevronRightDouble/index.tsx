import React from 'react';

import { foregroundColorVars } from '~/design-system/styles/core.css';
import { ForegroundColor } from '~/design-system/styles/designTokens';

export function ChevronRightDouble({
  width = 15.6,
  height = 14,
  colorLeft,
  colorRight,
  opacity,
}: {
  width?: number;
  height?: number;
  colorLeft: ForegroundColor;
  colorRight: ForegroundColor;
  opacity?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5379 7C8.5379 6.6179 8.40034 6.30459 8.08702 6.00655L2.30973 0.343886C2.08047 0.114629 1.79772 0 1.46148 0C0.788988 0 0.23877 0.550218 0.23877 1.21507C0.23877 1.55131 0.376324 1.86463 0.628508 2.10917L5.66453 6.99236L0.628508 11.8832C0.376324 12.1354 0.23877 12.441 0.23877 12.7849C0.23877 13.4574 0.788988 14 1.46148 14C1.79772 14 2.08047 13.8854 2.30973 13.6561L8.08702 7.99345C8.40798 7.68777 8.5379 7.37445 8.5379 7Z"
        fill={foregroundColorVars[colorLeft]}
        fillOpacity={opacity}
      />
      <path
        d="M15.7613 7C15.7613 6.6179 15.6237 6.30459 15.3104 6.00655L9.53311 0.343886C9.30385 0.114629 9.0211 0 8.68486 0C8.01237 0 7.46215 0.550218 7.46215 1.21507C7.46215 1.55131 7.5997 1.86463 7.85189 2.10917L12.8879 6.99236L7.85189 11.8832C7.5997 12.1354 7.46215 12.441 7.46215 12.7849C7.46215 13.4574 8.01237 14 8.68486 14C9.0211 14 9.30385 13.8854 9.53311 13.6561L15.3104 7.99345C15.6314 7.68777 15.7613 7.37445 15.7613 7Z"
        fill={foregroundColorVars[colorRight]}
        fillOpacity={opacity}
      />
    </svg>
  );
}
