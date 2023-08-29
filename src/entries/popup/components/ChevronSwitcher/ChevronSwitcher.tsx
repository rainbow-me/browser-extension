import React from 'react';

import { foregroundColorVars } from '~/design-system/styles/core.css';
import { ForegroundColor } from '~/design-system/styles/designTokens';

export function ChevronSwitcher({
  width = 7,
  height = 12,
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
      <path d="M6.85547 5.76953C6.85547 6.00977 6.77344 6.20898 6.58008 6.39648L2.06836 10.8086C1.91602 10.9609 1.73438 11.0371 1.51758 11.0371C1.07812 11.0371 0.720703 10.6855 0.720703 10.2461C0.720703 10.0234 0.814453 9.83008 0.972656 9.67188L4.98047 5.76367L0.972656 1.86719C0.814453 1.70898 0.720703 1.50977 0.720703 1.29297C0.720703 0.853516 1.07812 0.507812 1.51758 0.507812C1.73438 0.507812 1.91602 0.578125 2.06836 0.730469L6.58008 5.14258C6.76758 5.33008 6.85547 5.5293 6.85547 5.76953Z" />
    </svg>
  );
}
