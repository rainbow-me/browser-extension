import * as React from 'react';

import { Box, Inline, Row, Rows, Text } from '~/design-system';

export const Toast = () => {
  return (
    <Box width="full" style={{ position: 'fixed', zIndex: 999999, bottom: 16 }}>
      <Inline alignHorizontal="center">
        <Box borderRadius="26px" background="surfaceMenu" width="fit">
          <Box paddingVertical="8px" paddingHorizontal="16px">
            <Rows space="6px">
              <Row>
                <Text color="label" size="12pt" weight="bold">
                  surfacePrimary
                </Text>
              </Row>
              <Row>
                <Text color="labelTertiary" size="11pt" weight="medium">
                  surfacePrimary
                </Text>
              </Row>
            </Rows>
          </Box>
        </Box>
      </Inline>
    </Box>
  );
};
