import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { i18n } from '~/core/languages';
import { txSpeedEmoji } from '~/core/references/txSpeed';
import { useGasStore } from '~/core/state';
import { GasFeeParams, GasSpeed } from '~/core/types/gas';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { handleSignificantDecimals } from '~/core/utils/numbers';
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
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { GweiInputMask } from '../InputMask/GweiInputMask/GweiInputMask';

const speeds = [GasSpeed.URGENT, GasSpeed.FAST, GasSpeed.NORMAL];

const TEXT_OVERFLOW_WIDTH = POPUP_DIMENSIONS.width - 235;

export const CustomGasSheet = ({
  setCustomMaxBaseFee,
  setCustomMinerTip,
  show,
  closeCustomGasSheet,
  setSelectedSpeed,
}: {
  show: boolean;
  setCustomMaxBaseFee: (maxBaseFee: string) => void;
  setCustomMinerTip: (maxBaseFee: string) => void;
  closeCustomGasSheet: () => void;
  setSelectedSpeed: (speed: GasSpeed) => void;
}) => {
  const {
    gasFeeParamsBySpeed: {
      custom: customSpeed,
      urgent: urgentSpeed,
      normal: normalSpeed,
      fast: fastSpeed,
    },
    customGasModified,
    currentBaseFee,
    selectedGas,
  } = useGasStore();

  const [selectedSpeedOption, setSelectedSpeedOption] = useState<GasSpeed>(
    selectedGas.option,
  );

  const storeSpeeds = useMemo(
    () => ({
      [GasSpeed.NORMAL]: normalSpeed,
      [GasSpeed.FAST]: fastSpeed,
      [GasSpeed.URGENT]: urgentSpeed,
      [GasSpeed.CUSTOM]: urgentSpeed,
    }),
    [fastSpeed, normalSpeed, urgentSpeed],
  );

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

  const setCustomGas = useCallback(() => {
    setSelectedSpeed(selectedSpeedOption);
    closeCustomGasSheet();
  }, [closeCustomGasSheet, selectedSpeedOption, setSelectedSpeed]);

  useEffect(() => {
    setSelectedSpeedOption(selectedGas.option);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

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
            {i18n.t('custom_gas.title')}
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
                      {i18n.t('custom_gas.current_base_fee')}
                    </Text>
                    <Text
                      color="label"
                      align="right"
                      size="14pt"
                      weight="semibold"
                    >
                      {handleSignificantDecimals(currentBaseFee, 0, 3, true)}
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
                  {i18n.t('custom_gas.max_base_fee')}
                </Text>
                <Box style={{ width: 98 }} marginRight="-4px">
                  <GweiInputMask
                    inputRef={maxBaseInputRef}
                    value={handleSignificantDecimals(maxBaseFee, 0, 3, true)}
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
                  {i18n.t('custom_gas.miner_tip')}
                </Text>
                <Box style={{ width: 98 }} marginRight="-4px">
                  <GweiInputMask
                    inputRef={minerTipInputRef}
                    value={handleSignificantDecimals(minerTip, 0, 3, true)}
                    variant="surface"
                    onChange={updateCustomMinerTip}
                  />
                </Box>
              </Inline>
            </Box>
            <Box paddingVertical="12px">
              <Inline alignHorizontal="justify" alignVertical="center">
                <Text color="label" align="left" size="14pt" weight="semibold">
                  {i18n.t('custom_gas.max_transaction_fee')}
                </Text>
                <TextOverflow
                  maxWidth={TEXT_OVERFLOW_WIDTH}
                  color="label"
                  align="right"
                  size="14pt"
                  weight="semibold"
                >
                  {customSpeed.gasFee.display}
                </TextOverflow>
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
              {i18n.t('custom_gas.transaction_speed')}
            </Text>
          </Box>

          <Stack space="2px">
            <Box
              paddingVertical="8px"
              borderRadius="12px"
              marginHorizontal="-12px"
              paddingHorizontal="12px"
              background={{
                default:
                  selectedSpeedOption === GasSpeed.CUSTOM
                    ? 'accent'
                    : 'transparent',
                hover: 'accent',
              }}
              onClick={() => setSelectedSpeedOption(GasSpeed.CUSTOM)}
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
                    <TextOverflow
                      maxWidth={TEXT_OVERFLOW_WIDTH}
                      align="left"
                      color="label"
                      size="11pt"
                      weight="semibold"
                    >
                      {customSpeed.gasFee.display}
                    </TextOverflow>
                  </Stack>
                </Inline>

                <Stack space="12px">
                  <TextOverflow
                    maxWidth={TEXT_OVERFLOW_WIDTH}
                    align="right"
                    color="label"
                    size="14pt"
                    weight="semibold"
                  >
                    {customSpeed.display}
                  </TextOverflow>
                  <TextOverflow
                    maxWidth={TEXT_OVERFLOW_WIDTH}
                    align="right"
                    color="label"
                    size="11pt"
                    weight="semibold"
                  >
                    {customSpeed.estimatedTime.display}
                  </TextOverflow>
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
                  background={{
                    default:
                      selectedSpeedOption === speed ? 'accent' : 'transparent',
                    hover: 'accent',
                  }}
                  onClick={() => setSelectedSpeedOption(speed)}
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
                        <TextOverflow
                          maxWidth={TEXT_OVERFLOW_WIDTH}
                          align="left"
                          color="label"
                          size="11pt"
                          weight="semibold"
                        >
                          {storeSpeeds[speed].gasFee.display}
                        </TextOverflow>
                      </Stack>
                    </Inline>

                    <Stack space="12px">
                      <TextOverflow
                        maxWidth={TEXT_OVERFLOW_WIDTH}
                        align="right"
                        color="label"
                        size="14pt"
                        weight="semibold"
                      >
                        {storeSpeeds[speed].display}
                      </TextOverflow>
                      <TextOverflow
                        maxWidth={TEXT_OVERFLOW_WIDTH}
                        align="right"
                        color="label"
                        size="11pt"
                        weight="semibold"
                      >
                        {storeSpeeds[speed].estimatedTime.display}
                      </TextOverflow>
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
                  onClick={closeCustomGasSheet}
                >
                  <Text color="labelSecondary" size="16pt" weight="bold">
                    {i18n.t('custom_gas.cancel')}
                  </Text>
                </Button>
              </Column>
              <Column>
                <Button
                  width="full"
                  color="accent"
                  height="44px"
                  variant="flat"
                  onClick={setCustomGas}
                >
                  <Text color="label" size="16pt" weight="bold">
                    {i18n.t('custom_gas.set')}
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
