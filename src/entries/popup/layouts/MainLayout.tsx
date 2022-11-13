import * as React from 'react';

import { Box } from '~/design-system';

export function MainLayout({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Box
      className={className}
      display="flex"
      flexDirection="column"
      height="full"
      style={style}
    >
      {children}
    </Box>
  );
}
