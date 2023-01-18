import React, { useState } from 'react';

import { i18n } from '~/core/languages';
import { txSpeedEmoji } from '~/core/references/txSpeed';
import { GasSpeed } from '~/core/types/gas';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { GweiInputMask } from '../InputMask/GweiInputMask/GweiInputMask';

const speeds = [GasSpeed.URGENT, GasSpeed.FAST, GasSpeed.NORMAL];

export const CustomGasSheet = () => {
  const [maxBaseFee, setMaxBaseFee] = useState('0');
  const [minerTip, setMinerTip] = useState('0');

  return (
    <Prompt background="surfaceSecondary" show={true} padding="16px">
      <Box paddingHorizontal="20px">
        <Box paddingVertical="27px">
          <Text color="label" align="center" size="14pt" weight="heavy">
            Gwei Settings
          </Text>
        </Box>
        <Box paddingBottom="8px">
          <Stack space="12px">
            <Box paddingBottom="12px">
              <Box style={{ height: 32 }}>
                <Stack space="12px">
                  <Inline height="full" alignHorizontal="right">
                    <Text
                      color="green"
                      align="center"
                      size="11pt"
                      weight="bold"
                    >
                      Rising
                    </Text>
                  </Inline>
                  <Inline height="full" alignHorizontal="justify">
                    <Text
                      color="label"
                      align="left"
                      size="14pt"
                      weight="semibold"
                    >
                      Current base fee
                    </Text>
                    <Text
                      color="label"
                      align="right"
                      size="14pt"
                      weight="semibold"
                    >
                      31 Gwei
                    </Text>
                  </Inline>
                </Stack>
              </Box>
            </Box>
            <Box style={{ height: 32 }}>
              <Inline
                height="full"
                alignHorizontal="justify"
                alignVertical="center"
              >
                <Text align="left" color="label" size="14pt" weight="semibold">
                  Max base fee
                </Text>
                <Box style={{ width: 98 }} marginRight="-4px">
                  <GweiInputMask
                    value={maxBaseFee}
                    variant="surface"
                    onChange={setMaxBaseFee}
                  />
                </Box>
              </Inline>
            </Box>
            <Box style={{ height: 32 }}>
              <Inline
                height="full"
                alignHorizontal="justify"
                alignVertical="center"
              >
                <Text align="left" color="label" size="14pt" weight="semibold">
                  Miner tip
                </Text>
                <Box style={{ width: 98 }} marginRight="-4px">
                  <GweiInputMask
                    value={minerTip}
                    variant="surface"
                    onChange={setMinerTip}
                  />
                </Box>
              </Inline>
            </Box>
            <Box style={{ height: 32 }}>
              <Inline
                height="full"
                alignHorizontal="justify"
                alignVertical="center"
              >
                <Text color="label" align="left" size="14pt" weight="semibold">
                  Max transaction fee
                </Text>
                <Text color="label" align="right" size="14pt" weight="semibold">
                  0.001
                </Text>
              </Inline>
            </Box>
          </Stack>
        </Box>

        {/* /// */}

        <Box
          background="surfaceSecondaryElevated"
          paddingBottom="20px"
          paddingTop="22px"
          marginHorizontal="-20px"
          paddingHorizontal="20px"
        >
          <Box paddingBottom="8px">
            <Text color="labelQuaternary" size="12pt" weight="semibold">
              Transaction speed
            </Text>
          </Box>

          <Stack space="2px">
            <Box
              paddingVertical="8px"
              borderRadius="12px"
              marginHorizontal="-12px"
              paddingHorizontal="12px"
              background={{ default: 'transparent', hover: 'accent' }}
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

            <Box>
              <Separator color="separatorTertiary" />
            </Box>

            {speeds.map((speed, i) => (
              <>
                <Box
                  key={i}
                  paddingVertical="8px"
                  borderRadius="12px"
                  marginHorizontal="-12px"
                  paddingHorizontal="12px"
                  background={{ default: 'transparent', hover: 'accent' }}
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

          {/* /// */}

          <Box paddingTop="20px">
            <Columns alignHorizontal="justify" space="12px">
              <Column>
                <Button
                  width="full"
                  color="fillSecondary"
                  height="44px"
                  variant="flat"
                >
                  <Text color="labelSecondary" size="16pt" weight="bold">
                    Cancel
                  </Text>
                </Button>
              </Column>
              <Column>
                <Button
                  width="full"
                  color="accent"
                  height="44px"
                  variant="flat"
                >
                  <Text color="label" size="16pt" weight="bold">
                    Set
                  </Text>
                </Button>
              </Column>
            </Columns>
          </Box>
        </Box>
      </Box>
    </Prompt>
  );
};
