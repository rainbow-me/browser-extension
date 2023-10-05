import React from 'react';

import { Box, Inline, Text } from '~/design-system';

export const ShortcutHint = ({
  hint,
  small,
}: {
  hint: string;
  small?: boolean;
}) => {
  const height = small ? '14px' : '18px';
  const width = small ? '16px' : '18px';
  const widthKey = (hint?.length || 0) > 1 ? 'minWidth' : 'width';
  return (
    <Box
      background="fillSecondary"
      padding="4px"
      borderRadius={small ? '4px' : '5px'}
      boxShadow="1px"
      style={{ [widthKey]: width, height }}
    >
      <Inline alignHorizontal="center" alignVertical="center">
        <Box style={{ marginTop: small ? -1 : 1 }}>
          <Text
            size={small ? '11pt' : '12pt'}
            color="labelSecondary"
            weight="bold"
          >
            {hint}
          </Text>
        </Box>
      </Inline>
    </Box>
  );
};
