import React from 'react';

import { Box, Symbol } from '~/design-system';

export function Checkbox({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick?: () => void;
}) {
  return (
    <Box
      borderRadius="28px"
      background={selected ? 'accent' : 'transparent'}
      borderColor={selected ? 'accent' : 'separatorSecondary'}
      borderWidth="1px"
      alignItems="center"
      justifyContent="center"
      display="flex"
      onClick={onClick}
      style={{
        width: '18px',
        height: '18px',
      }}
    >
      {selected && (
        <Symbol symbol="checkmark" size={8} color="label" weight="bold" />
      )}
    </Box>
  );
}
