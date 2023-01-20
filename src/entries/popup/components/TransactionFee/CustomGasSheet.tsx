import React, { useCallback, useEffect, useRef, useState } from 'react';

import { i18n } from '~/core/languages';
import { txSpeedEmoji } from '~/core/references/txSpeed';
import { useGasStore } from '~/core/state';
import { GasFeeParams, GasSpeed } from '~/core/types/gas';
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

export const CustomGasSheet = ({
  setCustomMaxBaseFee,
  setCustomMinerTip,
  show,
  hideCustomGasSheet,
}: {
  show: boolean;
  setCustomMaxBaseFee: (maxBaseFee: string) => void;
  setCustomMinerTip: (maxBaseFee: string) => void;
  hideCustomGasSheet: () => void;
}) => {
  const {
    gasFeeParamsBySpeed: { custom: customSpeed, urgent: urgentSpeed },
    customGasModified,
  } = useGasStore();

  const maxBaseInputRef = useRef<HTMLInputElement>(null);
  const minerTipInputRef = useRef<HTMLInputElement>(null);

  const [maxBaseFee, setMaxBaseFee] = useState(
    (customSpeed as GasFeeParams)?.maxBaseFee?.gwei,
  );
  const [minerTip, setMinerTip] = useState(
    (customSpeed as GasFeeParams)?.maxPriorityFeePerGas?.gwei,
  );

  useEffect(() => {
    if (
      !customGasModified &&
      (urgentSpeed as GasFeeParams)?.maxBaseFee?.gwei !== maxBaseFee
    ) {
      setMaxBaseFee((urgentSpeed as GasFeeParams)?.maxBaseFee?.gwei);
      if (maxBaseInputRef?.current) {
        maxBaseInputRef.current.value = (
          urgentSpeed as GasFeeParams
        )?.maxBaseFee?.gwei;
      }
    }
  }, [customGasModified, urgentSpeed, maxBaseFee]);

  useEffect(() => {
    if (
      !customGasModified &&
      (urgentSpeed as GasFeeParams)?.maxPriorityFeePerGas?.gwei !== minerTip
    ) {
      setMinerTip((urgentSpeed as GasFeeParams)?.maxPriorityFeePerGas?.gwei);
      if (minerTipInputRef?.current) {
        minerTipInputRef.current.value = (
          urgentSpeed as GasFeeParams
        )?.maxPriorityFeePerGas?.gwei;
      }
    }
  }, [customGasModified, urgentSpeed, maxBaseFee, minerTip]);

  const updateCustomMaxBaseFee = useCallback(
    (maxBaseFee: string) => {
      setCustomMaxBaseFee(maxBaseFee);
      setMaxBaseFee(maxBaseFee);
    },
    [setCustomMaxBaseFee],
  );

  const updateCustomMinerTip = useCallback(
    (minertip: string) => {
      setCustomMinerTip(minertip);
      setMinerTip(minertip);
    },
    [setCustomMinerTip],
  );

  return (
    <Prompt
      background="surfaceSecondary"
      show={show}
      padding="16px"
      scrimBackground
    >
      <Box paddingHorizontal="20px">
        <Box paddingVertical="27px">
          <Text color="label" align="center" size="14pt" weight="heavy">
            Gwei Settings
          </Text>
        </Box>
        <Box paddingBottom="8px">
          <Stack space="12px">
            <Box paddingBottom="12px">
              <Box height="full">
                <Stack space="12px">
                  <Inline height="full" alignHorizontal="right">
                    <Text
                      color="orange"
                      align="center"
                      size="11pt"
                      weight="bold"
                    >
                      Rising
                    </Text>
                  </Inline>
                  <Inline
                    height="full"
                    alignHorizontal="justify"
                    alignVertical="bottom"
                  >
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
            <Box>
              <Inline
                height="fit"
                alignHorizontal="justify"
                alignVertical="center"
              >
                <Text align="left" color="label" size="14pt" weight="semibold">
                  Max base fee
                </Text>
                <Box style={{ width: 98 }} marginRight="-4px">
                  <GweiInputMask
                    inputRef={maxBaseInputRef}
                    value={maxBaseFee}
                    variant="surface"
                    onChange={updateCustomMaxBaseFee}
                  />
                </Box>
              </Inline>
            </Box>
            <Box>
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
                    inputRef={minerTipInputRef}
                    value={minerTip}
                    variant="surface"
                    onChange={updateCustomMinerTip}
                  />
                </Box>
              </Inline>
            </Box>
            <Box paddingVertical="12px">
              <Inline alignHorizontal="justify" alignVertical="center">
                <Text color="label" align="left" size="14pt" weight="semibold">
                  Max transaction fee
                </Text>
                <Text color="label" align="right" size="14pt" weight="semibold">
                  {customSpeed.gasFee.display}
                </Text>
              </Inline>
            </Box>
          </Stack>
        </Box>

        <Box
          background="surfaceSecondaryElevated"
          paddingBottom="20px"
          paddingTop="22px"
          marginHorizontal="-20px"
          paddingHorizontal="20px"
          style={{
            borderEndEndRadius: 16,
            borderEndStartRadius: 16,
          }}
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

          <Box paddingTop="20px">
            <Columns alignHorizontal="justify" space="12px">
              <Column>
                <Button
                  width="full"
                  color="fillSecondary"
                  height="44px"
                  variant="flat"
                  onClick={hideCustomGasSheet}
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
