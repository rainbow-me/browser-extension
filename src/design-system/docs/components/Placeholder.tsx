import React from 'react';
import { Box } from '../../components/Box/Box';

export const Placeholder = ({
  height = 40,
  width,
}: {
  height?: number | '100%';
  width?: number | '100%';
}) => {
  return (
    <Box
      background="surfaceSecondaryElevated"
      borderColor="separator"
      borderWidth="1px"
      style={{
        height,
        width,
      }}
    />
  );
};
