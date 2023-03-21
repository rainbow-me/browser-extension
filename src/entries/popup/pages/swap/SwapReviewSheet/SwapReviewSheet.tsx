import React from 'react';

import { Box, Inline, Stack, Text } from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';

export type SwapReviewSheetProps = {
  show: boolean;
};

export const SwapReviewSheet = ({ show }: SwapReviewSheetProps) => {
  return (
    <BottomSheet show={show}>
      <Box>
        <Stack space="12px">
          <Box style={{ height: '64px' }}>
            <Box paddingVertical="27px">
              <Inline alignHorizontal="center" alignVertical="center">
                <Text color="label" size="14pt" weight="bold">
                  Review & Swap
                </Text>
              </Inline>
            </Box>
          </Box>
        </Stack>
      </Box>
      <Box>
        <Stack space="24px"></Stack>
      </Box>
    </BottomSheet>
  );
};
