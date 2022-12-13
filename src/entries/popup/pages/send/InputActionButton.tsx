import React from 'react';

import { Box, Inline, Symbol } from '~/design-system';

export const InputActionButon = ({
  showClose,
  onClose,
}: {
  showClose: boolean;
  onClose: () => void;
}) => {
  return showClose ? (
    <Box
      style={{
        width: 24,
        height: 24,
      }}
      borderRadius="12px"
      background="surfaceMenu"
      borderWidth="1px"
      borderColor="buttonStroke"
      onClick={onClose}
    >
      <Inline height="full" alignHorizontal="center" alignVertical="center">
        <Symbol size={8} symbol={'xmark'} weight="bold" color="label" />
      </Inline>
    </Box>
  ) : (
    <Symbol
      size={18}
      symbol={'chevron.down.circle'}
      weight="semibold"
      color="labelQuaternary"
    />
  );
};
