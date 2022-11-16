import * as React from 'react';

import { Box } from '~/design-system';
import { BackgroundColor } from '~/design-system/styles/designTokens';

export function StickyHeader({
  background,
  children,
  height,
  topOffset,
}: {
  background?: BackgroundColor;
  children: React.ReactNode;
  height: number;
  topOffset: number;
}) {
  return (
    <Box position="sticky" style={{ top: topOffset, zIndex: 1 }}>
      {background && (
        <Box
          background="surfacePrimaryElevated"
          style={{
            height: height,
            position: 'absolute',
            left: 0,
            right: 0,
            zIndex: -1,
          }}
          width="full"
        />
      )}
      <Box background={background} style={{ height: height }}>
        {children}
      </Box>
    </Box>
  );
}
