import React, { useState } from 'react';

import {
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { Toggle } from '~/design-system/components/Toggle/Toggle';

interface SwapSettingsProps {
  accentColor?: string;
  show: boolean;
  onDone: () => void;
}

export const SwapSettings = ({
  accentColor,
  show,
  onDone,
}: SwapSettingsProps) => {
  const [toggleChecked, setToggleChecked] = useState(false);
  return (
    <BottomSheet background="scrim" show={show}>
      <AccentColorProviderWrapper color={accentColor}>
        <Box paddingHorizontal="20px" paddingBottom="20px">
          <Stack space="10px">
            <Box>
              <Box style={{ height: '64px' }}>
                <Inline
                  height="full"
                  alignVertical="center"
                  alignHorizontal="center"
                >
                  <Text align="center" color="label" size="14pt" weight="heavy">
                    Swap Settings
                  </Text>
                </Inline>
              </Box>
              <Stack space="12px">
                <Box style={{ height: '32px' }}>
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
                      accentColor={accentColor}
                      checked={toggleChecked}
                      handleChange={setToggleChecked}
                    />
                  </Inline>
                </Box>

                <Box style={{ height: '32px' }}>
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
                      accentColor={accentColor}
                      checked={toggleChecked}
                      handleChange={setToggleChecked}
                    />
                  </Inline>
                </Box>

                <Box style={{ height: '32px' }}>
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline alignVertical="center" space="7px">
                      <Text color="label" size="14pt" weight="semibold">
                        Max slippage
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
                      accentColor={accentColor}
                      checked={toggleChecked}
                      handleChange={setToggleChecked}
                    />
                  </Inline>
                </Box>
              </Stack>
            </Box>
            <Box width="full">
              <Button
                width="full"
                color="fillSecondary"
                height="28px"
                variant="plain"
              >
                <Text
                  align="center"
                  color="labelSecondary"
                  size="14pt"
                  weight="bold"
                >
                  Use defaults
                </Text>
              </Button>
            </Box>
            <Box style={{ width: '102px' }}>
              <Separator color="separatorTertiary" strokeWeight="1px" />
            </Box>
            <Box width="full" paddingTop="20px">
              <Button
                width="full"
                color="accent"
                height="44px"
                variant="flat"
                onClick={onDone}
              >
                <Text align="center" color="label" size="16pt" weight="bold">
                  Done
                </Text>
              </Button>
            </Box>
          </Stack>
        </Box>
      </AccentColorProviderWrapper>
    </BottomSheet>
  );
};
