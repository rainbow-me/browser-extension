import React, { forwardRef } from 'react';

import { Box, Stack } from '~/design-system';

interface FormProps {
  children: React.ReactNode;
}

const Form = forwardRef<HTMLDivElement, FormProps>(({ children }, ref) => {
  return (
    <Box
      ref={ref}
      background="surfaceSecondaryElevated"
      borderRadius="16px"
      boxShadow="12px"
      width="full"
      padding="16px"
    >
      <Stack space="8px">{children}</Stack>
    </Box>
  );
});

Form.displayName = 'Form';

export { Form };
