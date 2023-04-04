import React, { forwardRef } from 'react';

import { Box } from '~/design-system';

import useMousePosition from './useMousePosition';

export const Cursor = forwardRef(
  (_, ref: React.ForwardedRef<HTMLDivElement>) => {
    const { x, y } = useMousePosition();
    return (
      <>
        <Box
          background="pink"
          ref={ref}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            top: `${y}px`,
            left: `${x}px`,
          }}
        />
      </>
    );
  },
);

Cursor.displayName = 'Cursor';
