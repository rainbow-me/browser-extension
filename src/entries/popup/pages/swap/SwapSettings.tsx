import React, { useState } from 'react';

import { Box, ButtonSymbol, Inline, Stack, Text } from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { Toggle } from '~/design-system/components/Toggle/Toggle';

export const SwapSettings = ({ show }: { show: boolean }) => {
  const [toggleChecked, setToggleChecked] = useState(false);
  return (
    <>
      <BottomSheet show={show}>
        <Stack space="10px">
          <Box>
            <Box style={{ height: '64px' }}>
              <Text color="label" size="14pt" weight="heavy">
                Swap Settings
              </Text>
            </Box>
            <Stack space="12px">
              <Box>
                <Inline alignVertical="center" alignHorizontal="justify">
                  <Inline alignVertical="center" space="7px">
                    <Text color="label" size="14pt" weight="semibold">
                      Route swaps via
                    </Text>
                    <ButtonSymbol
                      symbol="info.circle.fill"
                      color="labelQuaternary"
                      height="28px"
                      variant="transparent"
                      onClick={() => null}
                    />
                  </Inline>
                  <Toggle
                    checked={toggleChecked}
                    handleChange={setToggleChecked}
                  />
                </Inline>
              </Box>

              <Inline alignVertical="center" alignHorizontal="justify">
                <Inline alignVertical="center" space="7px">
                  <Text color="label" size="14pt" weight="semibold">
                    Use Flashbots
                  </Text>
                  <ButtonSymbol
                    symbol="info.circle.fill"
                    color="labelQuaternary"
                    height="28px"
                    variant="transparent"
                    onClick={() => null}
                  />
                </Inline>
                <Toggle
                  checked={toggleChecked}
                  handleChange={setToggleChecked}
                />
              </Inline>
            </Stack>
          </Box>
          <Box></Box>
          <Box></Box>
        </Stack>
      </BottomSheet>
    </>
  );
};
