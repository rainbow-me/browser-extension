import React from 'react';

import { i18n } from '~/core/languages';
import { txSpeedEmoji } from '~/core/references/txSpeed';
import { GasSpeed } from '~/core/types/gas';
import { Box, Inline, Separator, Stack, Text } from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

const speeds = [GasSpeed.URGENT, GasSpeed.FAST, GasSpeed.NORMAL];

export const CustomGasSheet = () => {
  return (
    <Prompt background="surfaceSecondary" show={true} padding="16px">
      <Box paddingVertical="27px">
        <Text color="label" align="center" size="14pt" weight="heavy">
          Gwei Settings
        </Text>
      </Box>
      <Stack space="12px">
        <Box paddingBottom="12px">
          <Box style={{ height: 32 }} paddingLeft="20px" paddingRight="16px">
            <Stack space="12px">
              <Inline height="full" alignHorizontal="right">
                <Text color="green" align="center" size="11pt" weight="bold">
                  Rising
                </Text>
              </Inline>
              <Inline height="full" alignHorizontal="justify">
                <Text
                  color="label"
                  align="center"
                  size="14pt"
                  weight="semibold"
                >
                  Current base fee
                </Text>
                <Text
                  color="label"
                  align="center"
                  size="14pt"
                  weight="semibold"
                >
                  Max base fee
                </Text>
              </Inline>
            </Stack>
          </Box>
        </Box>
        <Box style={{ height: 32 }} paddingLeft="20px" paddingRight="16px">
          <Inline
            height="full"
            alignHorizontal="justify"
            alignVertical="center"
          >
            <Text color="label" align="center" size="14pt" weight="semibold">
              Max base fee
            </Text>
            <Text color="label" align="center" size="14pt" weight="semibold">
              Max base fee
            </Text>
          </Inline>
        </Box>
        <Box style={{ height: 32 }} paddingLeft="20px" paddingRight="16px">
          <Inline
            height="full"
            alignHorizontal="justify"
            alignVertical="center"
          >
            <Text color="label" align="center" size="14pt" weight="semibold">
              Miner tip
            </Text>
            <Text color="label" align="center" size="14pt" weight="semibold">
              Max base fee
            </Text>
          </Inline>
        </Box>
        <Box style={{ height: 32 }} paddingLeft="20px" paddingRight="16px">
          <Inline
            height="full"
            alignHorizontal="justify"
            alignVertical="center"
          >
            <Text color="label" align="center" size="14pt" weight="semibold">
              Max transaction fee
            </Text>
            <Text color="label" align="center" size="14pt" weight="semibold">
              Max base fee
            </Text>
          </Inline>
        </Box>
      </Stack>

      {/* /// */}

      <Box background="surfaceSecondaryElevated">
        <Text color="labelQuaternary" size="12pt" weight="semibold">
          Transaction speed
        </Text>

        <Stack space="2px">
          <Box
            paddingVertical="8px"
            paddingHorizontal="12px"
            borderRadius="12px"
            borderWidth="1px"
            borderColor="buttonStroke"
          >
            <Inline alignVertical="center" alignHorizontal="justify">
              <Inline space="10px" alignVertical="center">
                <Text weight="semibold" size="14pt">
                  {txSpeedEmoji[GasSpeed.CUSTOM]}
                </Text>
                <Stack space="12px">
                  <Text
                    align="left"
                    color="label"
                    size="14pt"
                    weight="semibold"
                  >
                    {i18n.t(`transaction_fee.custom`)}
                  </Text>
                  <Text
                    align="left"
                    color="label"
                    size="11pt"
                    weight="semibold"
                  >
                    0.001
                  </Text>
                </Stack>
              </Inline>

              <Stack space="12px">
                <Text align="right" color="label" size="14pt" weight="semibold">
                  55 Gwei
                </Text>
                <Text align="right" color="label" size="11pt" weight="semibold">
                  ~ 5 sec
                </Text>
              </Stack>
            </Inline>
          </Box>

          <Box paddingHorizontal="20px">
            <Separator color="separatorTertiary" />
          </Box>

          {speeds.map((speed, i) => (
            <>
              <Box
                key={i}
                paddingVertical="8px"
                paddingHorizontal="12px"
                borderRadius="12px"
                borderWidth="1px"
                borderColor="buttonStroke"
              >
                <Inline alignVertical="center" alignHorizontal="justify">
                  <Inline space="10px" alignVertical="center">
                    <Text weight="semibold" size="14pt">
                      {txSpeedEmoji[speed]}
                    </Text>
                    <Stack space="12px">
                      <Text
                        align="left"
                        color="label"
                        size="14pt"
                        weight="semibold"
                      >
                        {i18n.t(`transaction_fee.${speed}`)}
                      </Text>
                      <Text
                        align="left"
                        color="label"
                        size="11pt"
                        weight="semibold"
                      >
                        0.001
                      </Text>
                    </Stack>
                  </Inline>

                  <Stack space="12px">
                    <Text
                      align="right"
                      color="label"
                      size="14pt"
                      weight="semibold"
                    >
                      55 Gwei
                    </Text>
                    <Text
                      align="right"
                      color="label"
                      size="11pt"
                      weight="semibold"
                    >
                      ~ 5 sec
                    </Text>
                  </Stack>
                </Inline>
              </Box>
              {i !== speeds.length - 1 && (
                <Box paddingHorizontal="20px">
                  <Separator color="separatorTertiary" />
                </Box>
              )}
            </>
          ))}
        </Stack>
      </Box>
    </Prompt>
  );
};
