import React from 'react';
import { Box } from '../../components/Box/Box';

export const Placeholder = ({
  className,
  height = 60,
  width,
}: {
  className?: string;
  height?: number | '100%';
  width?: number | '100%';
}) => {
  return (
    <Box
      className={className}
      background="fill"
      borderColor="separator"
      borderWidth="1px"
      style={{
        height,
        width,
      }}
    />
  );
};
